import Header from '../components/Header';
import Footer from '../components/Footer';
import { useTema } from '../contexts/ThemeContext';
import { Activity, ShieldCheck, Smartphone, Users, RefreshCw, Sun, Moon } from 'lucide-react';
import { Link } from 'react-router-dom';

import fundo from '../assets/fundo.jpg';

const planos = [
	{
		nome: 'Free',
		preco: 'R$ 0,00',
		descricao: 'Ideal para testes e uso básico',
		observacao: 'Até 5 cadastros e até 15 agendamentos',
		cor: 'border-blue-400',
		destaque: false,
		selecionado: true,
	},
	{
		nome: 'Starter',
		preco: 'R$ 9,99',
		descricao: 'Recursos essenciais para clínicas pequenas',
		observacao: 'Até 30 cadastros e até 100 agendamentos',
		cor: 'border-green-400',
		destaque: true,
		selecionado: false,
		maisEscolhido: true,
	},
	{
		nome: 'Premium',
		preco: 'R$ 19,99',
		descricao: 'Funcionalidades avançadas e suporte prioritário',
		observacao: 'Cadastros e agendamentos ilimitados',
		cor: 'border-yellow-400',
		destaque: false,
		selecionado: false,
	},
];

const beneficios = [
	{ icon: <Smartphone className="w-6 h-6 text-blue-500" />, texto: 'Interface intuitiva e responsiva' },
	{ icon: <ShieldCheck className="w-6 h-6 text-green-500" />, texto: 'Segurança e privacidade dos dados' },
	{ icon: <Users className="w-6 h-6 text-indigo-500" />, texto: 'Suporte dedicado para sua clínica' },
	{ icon: <RefreshCw className="w-6 h-6 text-yellow-500" />, texto: 'Atualizações constantes e novidades' },
];

const LandingContratacao = () => {
	const { theme, toggleTheme } = useTema();

	return (
		<div className="min-h-screen flex flex-col relative">
			{/* Imagem de fundo */}
			<div className="absolute inset-0 -z-20 w-full h-full">
				<img
					src={fundo}
					alt="Consultório médico"
					className="w-full h-full object-cover opacity-70 select-none pointer-events-none" // sem blur, opacidade aumentada
					draggable={false}
					style={{width: '100%', height: '100%'}}
				/>
			</div>

			{/* Gradiente sobre a imagem, agora com transparência */}
			<div className="absolute inset-0 -z-10 w-full h-full bg-gradient-to-br from-white/60 via-blue-50/60 to-yellow-50/60 dark:from-gray-900/60 dark:via-gray-800/60 dark:to-gray-700/60" />
			
			<Header>
				<div className="absolute right-8 top-4">
					<button
						onClick={toggleTheme}
						className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 shadow hover:bg-blue-100 dark:hover:bg-gray-600 transition-colors"
						aria-label="Alterar tema"
					>
						{theme === 'light' ? (
							<Moon className="w-5 h-5 text-blue-600" />
						) : (
							<Sun className="w-5 h-5 text-yellow-400" />
						)}
					</button>
				</div>
			</Header>

			<main className="flex-1 flex flex-col items-center justify-center px-4 pt-28 pb-8">
				<section className="max-w-5xl w-full mx-auto text-center space-y-8">
					<div className="flex flex-col items-center gap-3">
						<div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-blue-600 to-indigo-500 rounded-full shadow-2xl mb-2">
							<Activity className="w-12 h-12 text-white" />
						</div>
						<p className="text-xl text-gray-700 dark:text-gray-300 mb-2">
							A plataforma definitiva para clínicas odontológicas modernas.
						</p>
						<p className="text-base text-gray-600 dark:text-gray-400 mb-2">
							Agende, organize e encante seus pacientes com tecnologia, segurança e
							praticidade.
						</p>
						<p className="text-base text-gray-600 dark:text-gray-400">
							Escolha o plano ideal e comece agora mesmo!
						</p>
					</div>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-8">
						{planos.map((plano, idx) => (
							<div
								key={plano.nome}
								className={`relative flex flex-col items-center justify-between rounded-2xl p-12 shadow-xl bg-white dark:bg-gray-800 transition-all duration-300 min-h-[420px] hover:scale-[1.10] hover:shadow-2xl cursor-default z-0`}
							>
								{/* Glow fixo na borda, sem hover/transição */}
								<div
									className="absolute inset-0 rounded-2xl pointer-events-none z-[-1]"
									style={{
										boxShadow: plano.destaque
											? '0 0 32px 8px rgba(34,197,94,0.35)' // verde
											: idx === planos.length - 1
												? '0 0 32px 8px rgba(250,204,21,0.25)' // amarelo
												: '0 0 32px 8px rgba(59,130,246,0.22)', // azul
										transition: 'box-shadow 0s', // garante que não anima
									}}
								/>
								{plano.maisEscolhido && (
									<span className="mb-2 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-bold">
										Mais escolhido
									</span>
								)}
								<h3
									className={`text-3xl font-bold mb-2 ${
										plano.destaque
											? 'text-yellow-500 dark:text-yellow-300'
											: 'text-blue-600 dark:text-blue-300'
									}`}
								>
									{plano.nome}
								</h3>
								<p className="text-5xl font-extrabold mb-2 text-gray-900 dark:text-white">
									{plano.preco}
								</p>
								<p className="text-base text-gray-600 dark:text-gray-400 mb-2 text-center">
									{plano.descricao}
								</p>
								<p className="text-xs text-gray-500 dark:text-gray-400 mb-4 text-center">
									{plano.observacao}
								</p>
								{plano.selecionado ? (
									<span className="w-full py-2 mt-2 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 font-semibold rounded-lg cursor-default">
										Selecionado
									</span>
								) : (
									<button
										type="button"
										className={`w-full py-2 mt-2 rounded-lg font-bold text-white ${
											plano.destaque
												? 'bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700'
												: 'bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600'
										}`}
									>
										Comprar
									</button>
								)}
							</div>
						))}
					</div>
				</section>
				<section className="w-full max-w-5xl mx-auto text-center mt-32">
					<p className="text-2xl text-gray-700 dark:text-gray-300 font-bold mb-8">
						Por que escolher o DentalCare?
					</p>
					<div className="grid grid-cols-1 md:grid-cols-4 gap-6 max-w-5xl mx-auto mb-8">
						{beneficios.map((b, idx) => (
							<div
								key={idx}
								className="flex flex-col items-center gap-4 bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
							>
								{b.icon}
								<span className="text-lg text-gray-700 dark:text-gray-300 text-center">
									{b.texto}
								</span>
							</div>
						))}
					</div>
					<Link
						to="/login"
						className="inline-block mt-10 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white text-lg font-bold shadow-lg hover:from-blue-700 hover:to-indigo-700 transition-all"
					>
						Voltar para Login
					</Link>
				</section>
			</main>
			<Footer />
		</div>
	);
};

export default LandingContratacao;
