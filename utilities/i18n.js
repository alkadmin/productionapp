import { createContext, useContext } from 'react';
import { useRouter } from 'next/router';
import en from '../public/locales/en/common.json';
import es from '../public/locales/es/common.json';

const resources = { en, es };
const I18nContext = createContext({ t: (key) => key });

export const I18nProvider = ({ children }) => {
  const { locale = 'es' } = useRouter();
  const dictionary = resources[locale] || resources['es'];

  const t = (key, options = {}) => {
    const value = key.split('.').reduce((obj, k) => (obj && obj[k]) ? obj[k] : key, dictionary);
    return Object.keys(options).reduce(
      (str, param) => str.replace(`{{${param}}}`, options[param]),
      value
    );
  };

  return (
    <I18nContext.Provider value={{ t }}>
      {children}
    </I18nContext.Provider>
  );
};

export const useTranslation = () => useContext(I18nContext);
