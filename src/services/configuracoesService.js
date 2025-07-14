const API_URL = 'http://172.16.31.176:3001/api';

export const servicoConfiguracoes = {
  async getConfiguracoes() {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/configuracoes`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  async saveConfiguracoes(config) {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/configuracoes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(config),
    });
    if (!response.ok) throw new Error('Erro ao salvar configurações');
    return response.json();
  }
};
