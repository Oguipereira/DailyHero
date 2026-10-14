import { EmConstrucao } from '@/components/EmConstrucao';
import { Tela } from '@/components/Tela';

export default function Relatorios() {
  return (
    <Tela titulo="Relatórios" subtitulo="Pais e profissional">
      <EmConstrucao
        fase="FASE 4"
        descricao="Abas Relatórios, Observações e Dia após dia; gráfico de acertos; status por módulo comparando a criança com ela mesma."
      />
    </Tela>
  );
}
