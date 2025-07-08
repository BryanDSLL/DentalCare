import { useState } from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { Moon, Sun, Settings as SettingsIcon } from 'lucide-react';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const [clinicData, setClinicData] = useState({
    name: 'Clínica Odontológica',
    address: '',
    phone: '',
    email: '',
    workingHours: {
      start: '08:00',
      end: '18:00'
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Save clinic data (would normally save to database)
    console.log('Clinic data saved:', clinicData);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Configurações</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gerencie as configurações da sua clínica
        </p>
      </div>

      {/* Theme Settings */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Aparência
        </h2>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
              {theme === 'light' ? (
                <Sun className="h-5 w-5 text-yellow-500" />
              ) : (
                <Moon className="h-5 w-5 text-blue-500" />
              )}
            </div>
            <div>
              <h3 className="font-medium text-gray-900 dark:text-white">
                Tema {theme === 'light' ? 'Claro' : 'Escuro'}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Altere a aparência da interface
              </p>
            </div>
          </div>
          <button
            onClick={toggleTheme}
            className="btn btn-secondary px-4 py-2 text-sm"
          >
            Alterar Tema
          </button>
        </div>
      </div>

      {/* Clinic Information */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informações da Clínica
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Nome da Clínica
            </label>
            <input
              type="text"
              value={clinicData.name}
              onChange={(e) => setClinicData({ ...clinicData, name: e.target.value })}
              className="input"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Endereço
            </label>
            <input
              type="text"
              value={clinicData.address}
              onChange={(e) => setClinicData({ ...clinicData, address: e.target.value })}
              className="input"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Telefone
              </label>
              <input
                type="tel"
                value={clinicData.phone}
                onChange={(e) => setClinicData({ ...clinicData, phone: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={clinicData.email}
                onChange={(e) => setClinicData({ ...clinicData, email: e.target.value })}
                className="input"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Horário de Funcionamento
            </label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Início
                </label>
                <input
                  type="time"
                  value={clinicData.workingHours.start}
                  onChange={(e) => setClinicData({
                    ...clinicData,
                    workingHours: { ...clinicData.workingHours, start: e.target.value }
                  })}
                  className="input"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
                  Fim
                </label>
                <input
                  type="time"
                  value={clinicData.workingHours.end}
                  onChange={(e) => setClinicData({
                    ...clinicData,
                    workingHours: { ...clinicData.workingHours, end: e.target.value }
                  })}
                  className="input"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              className="btn btn-primary px-6 py-2 text-sm"
            >
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>

      {/* System Info */}
      <div className="card">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Informações do Sistema
        </h2>
        <div className="space-y-3">
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Versão</span>
            <span className="font-medium text-gray-900 dark:text-white">1.0.0</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Último Backup</span>
            <span className="font-medium text-gray-900 dark:text-white">
              {new Date().toLocaleDateString('pt-BR')}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600 dark:text-gray-400">Status</span>
            <span className="px-2 py-1 text-xs bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded-full">
              Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;