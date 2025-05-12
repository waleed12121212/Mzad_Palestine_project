import { useLanguage } from '@/contexts/LanguageContext';

interface DirectionStyles {
  margin: string;
  padding: string;
  text: string;
  float: string;
  space: string;
  scroll: string;
  transform: string;
  borderRadius: string;
}

export const useDirection = () => {
  const { dir } = useLanguage();
  const isRTL = dir === 'rtl';

  const styles: DirectionStyles = {
    margin: {
      marginStart: isRTL ? 'margin-right' : 'margin-left',
      marginEnd: isRTL ? 'margin-left' : 'margin-right',
      ms: isRTL ? 'mr' : 'ml',
      me: isRTL ? 'ml' : 'mr',
    },
    padding: {
      paddingStart: isRTL ? 'padding-right' : 'padding-left',
      paddingEnd: isRTL ? 'padding-left' : 'padding-right',
      ps: isRTL ? 'pr' : 'pl',
      pe: isRTL ? 'pl' : 'pr',
    },
    text: {
      textAlign: isRTL ? 'right' : 'left',
      direction: dir,
    },
    float: {
      start: isRTL ? 'right' : 'left',
      end: isRTL ? 'left' : 'right',
    },
    space: {
      spaceX: isRTL ? 'space-x-reverse' : '',
    },
    scroll: {
      scrollPadding: isRTL ? 'scroll-padding-right' : 'scroll-padding-left',
      scrollMargin: isRTL ? 'scroll-margin-right' : 'scroll-margin-left',
    },
    transform: {
      translateX: isRTL ? 'translate-x-reverse' : '',
      rotateY: isRTL ? 'rotate-y-180' : '',
    },
    borderRadius: {
      start: isRTL ? 'rounded-r' : 'rounded-l',
      end: isRTL ? 'rounded-l' : 'rounded-r',
    },
  };

  return {
    isRTL,
    dir,
    styles,
    // Helper function to conditionally apply RTL/LTR classes
    getDirectionalClassName: (baseClass: string, rtlClass: string, ltrClass: string) => {
      return `${baseClass} ${isRTL ? rtlClass : ltrClass}`;
    },
  };
}; 