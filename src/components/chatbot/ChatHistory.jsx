import React from 'react';
import { Clock, MessageSquare, Trash2 } from 'lucide-react';

const ChatHistory = ({ isOpen, onClose, history, onClearHistory, onSelectHistory }) => {
  if (!isOpen) return null;

  const handleClearHistory = () => {
    if (window.confirm('Êtes-vous sûr de vouloir effacer tout l\'historique des conversations ?')) {
      onClearHistory();
    }
  };

  return (
    <div className="fixed top-4 right-6 w-80 max-h-96 bg-white rounded-xl shadow-2xl border border-gray-200 flex flex-col z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-indigo-700 text-white p-4 rounded-t-xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            <h3 className="font-semibold">Historique des conversations</h3>
          </div>
          <div className="flex items-center gap-1">
            {history.length > 0 && (
              <button
                onClick={handleClearHistory}
                className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
                title="Effacer tout l'historique"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-white/20 rounded-lg transition-colors"
              title="Fermer"
            >
              ×
            </button>
          </div>
        </div>
      </div>

      {/* History List */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {history.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-sm">Aucune conversation dans l'historique</p>
            <p className="text-gray-400 text-xs mt-1">
              Vos conversations passées apparaîtront ici
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {history.map((entry) => (
              <div
                key={entry.id}
                className="bg-white rounded-lg border border-gray-200 p-3 hover:border-indigo-300 hover:shadow-sm transition-all cursor-pointer"
                onClick={() => onSelectHistory(entry)}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">
                      {entry.summary}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-500">{entry.date}</span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-xs text-gray-500">
                        {entry.messageCount} message{entry.messageCount > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>
                  <MessageSquare className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-gray-200 bg-gray-50 rounded-b-xl">
        <p className="text-xs text-gray-500 text-center">
          💾 L'historique est sauvegardé localement
        </p>
      </div>
    </div>
  );
};

export default ChatHistory;