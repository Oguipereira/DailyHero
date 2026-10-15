import { View } from 'react-native';

import { Logo } from '@/components/Logo';
import { Tela } from '@/components/Tela';
import { Cartao, Texto, Titulo2 } from '@/components/ui';

/** Sobre nós: quem somos, parceiros e tutorial (textos do documento de apresentação). */
export default function Sobre() {
  return (
    <Tela voltar titulo="Sobre o Daily Hero">
      <View style={{ alignItems: 'center' }}>
        <Logo tamanho={120} />
      </View>
      <Cartao>
        <Titulo2>Quem somos</Titulo2>
        <Texto>
          O Daily Hero nasceu para transformar o primeiro contato de crianças com o aprendizado e a criação de hábitos numa experiência
          acessível, divertida e significativa. Todo herói começa com pequenos passos.
        </Texto>
        <Texto suave>
          Nosso foco são crianças de 4 a 10 anos, incluindo crianças autistas (leve, moderado ou não verbais). Pais, profissionais e
          crianças trabalham juntos no mesmo objetivo.
        </Texto>
      </Cartao>
      <Cartao>
        <Titulo2>Parceiros</Titulo2>
        <Texto suave>[Quem ajudou a fundamentar o projeto e tirar ele do papel]</Texto>
      </Cartao>
      <Cartao>
        <Titulo2>Tutorial</Titulo2>
        <Texto>1. Os pais escolhem os hábitos da casa, na ordem do dia.</Texto>
        <Texto>2. A criança aperta PLAY: faz as tasks da casa e depois os jogos.</Texto>
        <Texto>3. A lição gera um relatório para a família e o profissional.</Texto>
        <Texto>4. Todo dia que a lição é feita, a ofensiva sobe.</Texto>
      </Cartao>
    </Tela>
  );
}
