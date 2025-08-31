'use client';
import { useEffect, useState, useRef } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
    RadialBarChart, RadialBar, Legend, PolarAngleAxis
} from 'recharts';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { Card } from 'primereact/card';
import { FileText } from 'lucide-react';
import { useTranslation } from '../../utilities/i18n';



export default function FullProductionReport() {
    const { t } = useTranslation();
    const [sessionId, setSessionId] = useState(null);
    const [summary, setSummary] = useState([]);
    const [oeeData, setOeeData] = useState([]);
    const [downtime, setDowntime] = useState([]);
    const [issuesDOH, setIssuesDOH] = useState([]);
    const [issuesPKG, setIssuesPKG] = useState([]);
    const [issuesOther, setIssuesOther] = useState([]);
    const [mixDetails, setMixDetails] = useState([]);
    const [pallets, setPallets] = useState([]);
    const [sessionInfo, setSessionInfo] = useState(null);
    const page1Ref = useRef();
    const page2Ref = useRef();
    const page3Ref = useRef();
    const page4Ref = useRef();
    const formatDate = (str) => str?.slice(0, 10);
    const formatTime = (intTime) => {
        if (!intTime) return '';
        const hh = String(Math.floor(intTime / 100)).padStart(2, '0');
        const mm = String(intTime % 100).padStart(2, '0');
        return `${hh}:${mm}`;
    };

    const TYPE_LABELS = {
        C: t('report.typeLabels.C'),
        QA: t('report.typeLabels.QA'),
        O: t('report.typeLabels.O'),
        P: t('report.typeLabels.P')
    };

    useEffect(() => {
        const stored = localStorage.getItem('sessionCode');
        if (stored) setSessionId(stored);
    }, []);

    useEffect(() => {
        if (!sessionId) return;

        fetch(`/api/production/SummaryProdBySession?id=${sessionId}`).then(res => res.json()).then(setSummary);
        fetch(`/api/production/OEEBySession?id=${sessionId}`).then(res => res.json()).then(setOeeData);
        fetch(`/api/production/DownTimeBySesssion?id=${sessionId}`).then(res => res.json()).then(setDowntime);
        fetch(`/api/production/IssuesByTypeBySession?id=${sessionId}&type=DOH`).then(res => res.json()).then(setIssuesDOH);
        fetch(`/api/production/IssuesByTypeBySession?id=${sessionId}&type=PKG`).then(res => res.json()).then(setIssuesPKG);
        fetch(`/api/production/IssuesByTypeBySession?id=${sessionId}&type=ISSUES`).then(res => res.json()).then(setIssuesOther);
        fetch(`/api/production/IssuesBySession?id=${sessionId}`).then(res => res.json()).then(setMixDetails);
        fetch(`/api/production/PalletesBySession?id=${sessionId}`).then(res => res.json()).then(setPallets);
        fetch(`/api/production/Session?id=${sessionId}`).then(res => res.json()).then(res => setSessionInfo(res[0]));
    }, [sessionId]);

    const oee = (() => {
        const s = oeeData[0] || {};
        return {
            Availability: parseFloat(s["%Availability"] || 0),
            Performance: parseFloat(s["%Performance"] || 0),
            Quality: parseFloat(s["%Quality"] || 0),
            OEE: parseFloat(s["%OEE"] || 0)
        };
    })();

    const downtimeByType = Object.values(
        downtime.reduce((acc, row) => {
            const typeCode = row["U_CTA_Type"];
            const label = TYPE_LABELS[typeCode] || row.Type ;
            const minutes = row.TimeLoss || 0;
            if (!acc[label]) acc[label] = { name: label, minutes: 0 };
            acc[label].minutes += minutes;
            return acc;
        }, {})
    );

    const renderTable = (title, data, isPallets = false) => {
        const keys = isPallets
            ? Object.keys(data[0] || {}).slice(0, -5)
            : Object.keys(data[0] || {});
    
        return (
            <>
                <h4>{title}</h4>
                <table className="table-report">
                    <thead>
                        <tr>{keys.map(k => <th key={k}>{k}</th>)}</tr>
                    </thead>
                    <tbody>
                        {data.map((row, i) => (
                            <tr key={i}>
                                {keys.map((k, j) => (
                                    <td key={j}>
                                        {k.toLowerCase().includes('date') ? formatDate(row[k]) :
                                            k.toLowerCase().includes('time') && typeof row[k] === 'number' ? formatTime(row[k]) :
                                                row[k]}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </>
        );
    };
    

    const renderFooter = () => (
        <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '10px',
            marginTop: '1rem',
            borderTop: '1px solid #ccc',
            paddingTop: '0.5rem'
        }}>
            <div>
                {t('report.footer.address')}: {`${pallets[0]?.Street || ''}, ${pallets[0]?.City || ''}, ${pallets[0]?.ZipCode || ''}`}
            </div>
            <div>{t('report.footer.document')}</div>
            <div>{t('report.footer.effectiveDate')}: {new Date().toISOString().slice(0, 10)}</div>
            <div><strong>{t('report.footer.confidential')}</strong></div>
        </div>
    );

    const exportPDF = async () => {
        console.log('[exportPDF] Iniciando generación de PDF...');
      
        const pdf = new jsPDF('l', 'pt', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
      
        const capturePage = async (ref, addPage = true) => {
          const canvas = await html2canvas(ref.current, {
            backgroundColor: '#ffffff',
            scale: 1,
            useCORS: true
          });
      
          const imgData = canvas.toDataURL('image/png');
          const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      
          if (addPage) pdf.addPage();
          pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, imgHeight);
        };
      
        // Capturar todas las páginas (usa false solo en la primera)
        await capturePage(page1Ref, false);
        await capturePage(page2Ref);
        await capturePage(page3Ref);
        await capturePage(page4Ref);
      
        console.log('[exportPDF] Generación de PDF completada.');
      
        // Generar base64 correctamente
        const pdfBlob = pdf.output('blob');
        const reader = new FileReader();
      
        reader.onloadend = async () => {
          const base64data = reader.result;
          console.log('[exportPDF] Enviando base64 al backend...');
      
          await fetch('/api/SendReporEmail', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ base64pdf: base64data })
          });
      
          console.log('[exportPDF] PDF enviado al backend.');
        };
      
        reader.readAsDataURL(pdfBlob); // <- Esto convierte correctamente a base64
      };
      
      
    return (

        <Card
        title={
          <>
            <button onClick={exportPDF} style={{ marginRight: '10px', background: 'none', border: 'none', cursor: 'pointer' }}>
              <FileText size={18} />
            </button>
            {t('report.cardTitle')}
          </>
        }
      >
        {/* <div style={{ background: '#white' }}> */}
          
            <div ref={page1Ref} style={{ background: '#fff', padding: '1.5rem', fontSize: '11px' }}>
      
               
                {/* <div className='logo-img'></div> */}
                {sessionInfo && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <div><strong>{t('report.productionDate')}:</strong> {formatDate(sessionInfo.StartDate)}</div>
                        <div><strong>{t('report.line')}:</strong> {sessionInfo.Line}</div>
                        <div><strong>{t('report.shift')}:</strong> {sessionInfo.Shift}</div>
                        <div><strong>{t('report.headcount')}:</strong> {sessionInfo.HeadCount}</div>
                    </div>
                )}
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ flex: 2 }}>
                        <h4>{t('report.section1')}</h4>
                        {renderTable(t('report.summary'), summary)}
                        <div style={{ display: 'flex', gap: '1rem' }}>
                            <div style={{ flex: 1 }}>
                                <h2>{t('report.oeeTitle')}</h2>
                                <ResponsiveContainer width="100%" height={250}>
                                    <RadialBarChart
                                        cx="50%" cy="50%" innerRadius="40%" outerRadius="80%" barSize={10}
                                        data={[
                                            { name: t('report.oeeLabels.availability'), value: oee.Availability, fill: '#00C49F' },
                                            { name: t('report.oeeLabels.performance'), value: oee.Performance, fill: '#0088FE' },
                                            { name: t('report.oeeLabels.quality'), value: oee.Quality, fill: '#FFBB28' },
                                            { name: t('report.oeeLabels.oee'), value: oee.OEE, fill: '#FF4C4C' }
                                        ]}
                                    >
                                        <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
                                        <RadialBar minAngle={15} background clockWise dataKey="value" label={{ position: 'inside', fill: '#000', fontSize: 10, formatter: (val) => `${val.toFixed(1)}%` }} />
                                        <Legend iconSize={10} layout="vertical" verticalAlign="middle" align="right" />
                                    </RadialBarChart>
                                </ResponsiveContainer>
                            </div>
                            <div style={{ flex: 1 }}>
                                <h4>{t('report.downtime')}</h4>
                                <ResponsiveContainer width="100%" height={250}>
                                    <BarChart data={downtimeByType}>
                                        <XAxis dataKey="name" />
                                        <YAxis />
                                        <Tooltip formatter={(value) => [value, t('report.minutes')]} />
                                        <Bar dataKey="minutes" fill="#8884d8" />
                                    </BarChart>
                                </ResponsiveContainer>
                            </div>
                        </div>
                    </div>
                    <div style={{ flex: 1 }}>
                        <h4>{t('report.section2')}</h4>
                        {renderTable(t('report.dohIssues'), issuesDOH)}
                        {renderTable(t('report.pkgIssues'), issuesPKG)}
                        {renderTable(t('report.otherIssues'), issuesOther)}
                    </div>
                </div>
                {renderFooter()}
            </div>
            <div ref={page2Ref} style={{ background: '#fff', padding: '1.5rem', fontSize: '12px', marginTop: '1rem' }}>
                {renderTable(t('report.mixes'), mixDetails)}
            </div>

            <div ref={page3Ref} style={{ background: '#fff', padding: '1.5rem', fontSize: '12px', marginTop: '1rem' }}>
                {renderTable(t('report.pallets'), pallets, true)}
            </div>

            <div ref={page4Ref} style={{ background: '#fff', padding: '1.5rem', fontSize: '12px', marginTop: '1rem' }}>
                {renderTable(t('report.downtimeDetail'), downtime)}
            </div>

</Card>
        // </div>
    );
}