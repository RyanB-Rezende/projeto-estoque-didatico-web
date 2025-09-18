// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Suppress noisy logs in tests to keep output clean
(() => {
	if (typeof console === 'undefined') return;
	const originalLog = console.log.bind(console);
	const originalError = console.error.bind(console);

	const suppressedLogPatterns = [
		'Dados sendo enviados:',
		'✅ Usuário salvo no Supabase',
		'Buscando turmas no Supabase',
		'Turmas encontradas:',
	];
	const suppressedErrorPatterns = [
		'❌ Erro ao cadastrar usuário:',
		'Erro ao buscar turmas:',
		'Erro completo ao buscar turmas:',
	];

	console.log = (...args) => {
		const msg = args[0];
		if (typeof msg === 'string' && suppressedLogPatterns.some(p => msg.includes(p))) {
			return;
		}
		originalLog(...args);
	};

	console.error = (...args) => {
		const msg = args[0];
		if (typeof msg === 'string' && suppressedErrorPatterns.some(p => msg.includes(p))) {
			return;
		}
		originalError(...args);
	};
})();
