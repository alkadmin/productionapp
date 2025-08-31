"use strict";
exports.id = 2144;
exports.ids = [2144];
exports.modules = {

/***/ 2144:
/***/ ((module, __webpack_exports__, __webpack_require__) => {

__webpack_require__.a(module, async (__webpack_handle_async_dependencies__, __webpack_async_result__) => { try {
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "Z": () => (__WEBPACK_DEFAULT_EXPORT__)
/* harmony export */ });
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(997);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(6689);
/* harmony import */ var react__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var axios__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(9648);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(1664);
/* harmony import */ var next_link__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(next_link__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var primereact_datatable__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(7447);
/* harmony import */ var primereact_datatable__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(primereact_datatable__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var primereact_column__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(8145);
/* harmony import */ var primereact_column__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(primereact_column__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var primereact_button__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(1088);
/* harmony import */ var primereact_button__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(primereact_button__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var primereact_dropdown__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(1404);
/* harmony import */ var primereact_dropdown__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(primereact_dropdown__WEBPACK_IMPORTED_MODULE_7__);
/* harmony import */ var primereact_inputtext__WEBPACK_IMPORTED_MODULE_8__ = __webpack_require__(9093);
/* harmony import */ var primereact_inputtext__WEBPACK_IMPORTED_MODULE_8___default = /*#__PURE__*/__webpack_require__.n(primereact_inputtext__WEBPACK_IMPORTED_MODULE_8__);
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_9__ = __webpack_require__(8109);
/* harmony import */ var file_saver__WEBPACK_IMPORTED_MODULE_9___default = /*#__PURE__*/__webpack_require__.n(file_saver__WEBPACK_IMPORTED_MODULE_9__);
/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_10__ = __webpack_require__(6302);
/* harmony import */ var xlsx__WEBPACK_IMPORTED_MODULE_10___default = /*#__PURE__*/__webpack_require__.n(xlsx__WEBPACK_IMPORTED_MODULE_10__);
var __webpack_async_dependencies__ = __webpack_handle_async_dependencies__([axios__WEBPACK_IMPORTED_MODULE_2__]);
axios__WEBPACK_IMPORTED_MODULE_2__ = (__webpack_async_dependencies__.then ? (await __webpack_async_dependencies__)() : __webpack_async_dependencies__)[0];
"use client";











const ProductionOrders = ({ type  })=>{
    const [pOrders, setPOrders] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [filteredOrders, setFilteredOrders] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)([]);
    const [statusFilter, setStatusFilter] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("All");
    const [searchTerm, setSearchTerm] = (0,react__WEBPACK_IMPORTED_MODULE_1__.useState)("");
    const statusOptions = [
        {
            label: "All",
            value: "All"
        },
        {
            label: "Released",
            value: "Released"
        },
        {
            label: "Close",
            value: "Close"
        }
    ];
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        const fetchData = async ()=>{
            try {
                const response = await axios__WEBPACK_IMPORTED_MODULE_2__["default"].get(`/api/ProductionOrder${type}`);
                setPOrders(response.data);
                setFilteredOrders(response.data); // Mostrar todas las órdenes por defecto
            } catch (error) {
                console.error("Error fetching the production orders", error);
            }
        };
        fetchData();
    }, [
        type
    ]);
    (0,react__WEBPACK_IMPORTED_MODULE_1__.useEffect)(()=>{
        filterOrders();
    }, [
        statusFilter,
        searchTerm,
        pOrders
    ]);
    const filterOrders = ()=>{
        let filtered = pOrders;
        if (statusFilter !== "All") {
            filtered = filtered.filter((order)=>order.Status === statusFilter);
        }
        if (searchTerm) {
            filtered = filtered.filter((order)=>order?.OriginNum.includes(searchTerm.toLowerCase()));
        }
        setFilteredOrders(filtered);
    };
    const onStatusChange = (e)=>{
        setStatusFilter(e.value);
    };
    const onSearchChange = (e)=>{
        setSearchTerm(e.target.value);
    };
    const linkTemplate = (rowData)=>{
        return /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx((next_link__WEBPACK_IMPORTED_MODULE_3___default()), {
            href: `/production/${rowData.DocEntry}`,
            children: rowData.DocNum
        });
    };
    const dateTemplate = (rowData)=>{
        if (!rowData.StartDate) {
            return "";
        }
        const options = {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        };
        return new Date(rowData.StartDate).toLocaleDateString("en-US", options);
    };
    const dateTemplateDelivery = (rowData)=>{
        if (!rowData.DeliveryDate) {
            return "";
        }
        const options = {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
        };
        return new Date(rowData.DeliveryDate).toLocaleDateString("en-US", options);
    };
    // const exportToExcel = () => {
    //   const worksheet = XLSX.utils.json_to_sheet(filteredOrders);
    //   const workbook = XLSX.utils.book_new();
    //   XLSX.utils.book_append_sheet(workbook, worksheet, 'ProductionOrders');
    //   const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    //   const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    //   saveAs(data, 'ProductionOrders.xlsx');
    // };
    return /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.Fragment, {
        children: [
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("div", {
                className: "p-d-flex p-jc-between p-ai-center",
                children: [
                    /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)("h1", {
                        children: [
                            type,
                            " Production Orders"
                        ]
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx("div", {
                        className: "p-d-flex p-ai-center",
                        children: /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_dropdown__WEBPACK_IMPORTED_MODULE_7__.Dropdown, {
                            value: statusFilter,
                            options: statusOptions,
                            onChange: onStatusChange,
                            placeholder: "Select a Status",
                            className: "mb-3 p-mr-2"
                        })
                    })
                ]
            }),
            /*#__PURE__*/ (0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsxs)(primereact_datatable__WEBPACK_IMPORTED_MODULE_4__.DataTable, {
                value: filteredOrders,
                paginator: true,
                rows: 10,
                children: [
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        field: "CustomerPO",
                        header: "Customer PO"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        field: "Status",
                        header: "Status"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        field: "ItemCode",
                        header: "Product"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        field: "ProdName",
                        header: "Description"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        body: linkTemplate,
                        header: "Origin POs"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        field: "Mixes",
                        header: "Mixes"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        field: "Pallets",
                        header: "Pallets"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        body: dateTemplate,
                        header: "Started At"
                    }),
                    /*#__PURE__*/ react_jsx_runtime__WEBPACK_IMPORTED_MODULE_0__.jsx(primereact_column__WEBPACK_IMPORTED_MODULE_5__.Column, {
                        body: dateTemplateDelivery,
                        header: "Delivery Date"
                    })
                ]
            })
        ]
    });
};
/* harmony default export */ const __WEBPACK_DEFAULT_EXPORT__ = (ProductionOrders);

__webpack_async_result__();
} catch(e) { __webpack_async_result__(e); } });

/***/ })

};
;