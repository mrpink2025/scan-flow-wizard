import { useTranslate } from '@/hooks/useTranslate';

interface TProps {
  children: string;
  as?: keyof JSX.IntrinsicElements;
  className?: string;
}

/**
 * Componente de tradução inline
 * Uso: <T>Texto a ser traduzido</T>
 */
export const T = ({ children, as: Component = 'span', className }: TProps) => {
  const { useTranslatedText } = useTranslate();
  const translatedText = useTranslatedText(children);

  return <Component className={className}>{translatedText}</Component>;
};
