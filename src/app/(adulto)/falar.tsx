import { EmConstrucao } from '@/components/EmConstrucao';
import { Tela } from '@/components/Tela';

export default function Falar() {
  return (
    <Tela titulo="Falar" subtitulo="Figuras (PECS) com voz">
      <EmConstrucao fase="FASE 1" descricao="Frase montada, categorias e grade de figuras que falam em voz alta." />
    </Tela>
  );
}
