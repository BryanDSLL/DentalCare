import { Link } from 'react-router-dom';
import { Activity } from 'lucide-react';

const planos = [
  {
    nome: 'Free',
    preco: 'R$ 0,00',
    descricao: 'Ideal para testes e uso básico',
    observacao: 'Até 5 cadastros e até 15 agendamentos',
    cor: 'border-blue-400',
    destaque: false,
    selecionado: true
  },
  {
    nome: 'Starter',
    preco: 'R$ 9,99',
    descricao: 'Recursos essenciais para clínicas pequenas',
    observacao: 'Até 30 cadastros e até 100 agendamentos',
    cor: 'border-green-400',
    destaque: false,
    selecionado: false
  },
  {
    nome: 'Premium',
    preco: 'R$ 19,99',
    descricao: 'Funcionalidades avançadas e suporte prioritário',
    observacao: 'Cadastros e agendamentos ilimitados',
    cor: 'border-yellow-400',
    destaque: true,
    selecionado: false
  }
];

const LandingContratacao = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col items-center justify-center p-4">
    <div className="max-w-3xl w-full space-y-10">
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center w-20 h-20 bg-blue-600 rounded-full shadow-lg">
            <Activity className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white mb-2">DentalCare</h1>
        <p className="text-lg text-gray-700 dark:text-gray-300 mb-4">O sistema definitivo para gestão de clínicas odontológicas.</p>
        <p className="text-base text-gray-600 dark:text-gray-400 mb-2">Agende, organize e encante seus pacientes com uma plataforma moderna, segura e fácil de usar.</p>
        <p className="text-base text-gray-600 dark:text-gray-400">Escolha o plano ideal para sua clínica e comece agora mesmo!</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {planos.map((plano) => (
          <div key={plano.nome} className={`flex flex-col items-center justify-between border-2 rounded-xl p-8 shadow-lg bg-white dark:bg-gray-800 transition-all ${plano.cor} ${plano.destaque ? 'scale-105 ring-2 ring-yellow-400' : ''}`}> 
            <h3 className={`text-2xl font-bold mb-2 ${plano.destaque ? 'text-yellow-500 dark:text-yellow-300' : 'text-primary-600 dark:text-primary-300'}`}>{plano.nome}</h3>
            <p className="text-4xl font-extrabold mb-2 text-gray-900 dark:text-white">{plano.preco}</p>
            <p className="text-base text-gray-600 dark:text-gray-400 mb-2 text-center">{plano.descricao}</p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">{plano.observacao}</p>
            {plano.selecionado ? (
              <span className="btn w-full py-2 mt-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold cursor-default">Selecionado</span>
            ) : (
              <button type="button" className={`btn btn-primary w-full py-2 mt-2 ${plano.destaque ? 'bg-yellow-500 hover:bg-yellow-600 text-white' : ''}`}>Comprar</button>
            )}
          </div>
        ))}
      </div>
      <div className="text-center mt-10">
        <p className="text-lg text-gray-700 dark:text-gray-300 font-semibold mb-2">Por que escolher o DentalCare?</p>
        <ul className="list-disc list-inside text-gray-600 dark:text-gray-400 text-base mb-6">
          <li>Interface intuitiva e responsiva para qualquer dispositivo</li>
          <li>Segurança e privacidade dos dados dos pacientes</li>
          <li>Suporte dedicado para sua clínica crescer sem limites</li>
          <li>Atualizações constantes e novas funcionalidades</li>
        </ul>
        <Link to="/login" className="inline-block btn btn-secondary px-6 py-3 text-base font-bold">Voltar para Login</Link>
      </div>
    </div>
  </div>
);

export default LandingContratacao;
