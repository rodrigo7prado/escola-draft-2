"use client";

import { Button } from "./Button";

type AsyncProgressBarProps = {
  totalItems: number;
  processedItems: number;
  errorItems?: number;
  isCancellable?: boolean;
  onCancel?: () => void;
};

/**
 * DRY.BASE-UI:BARRA_PROGRESSO_ASINCRONA
 * Componente de barra de progresso para operações assíncronas longas
 */
export function AsyncProgressBar({
  totalItems,
  processedItems,
  errorItems = 0,
  isCancellable = false,
  onCancel,
}: AsyncProgressBarProps) {
  const percentage = totalItems > 0 ? (processedItems / totalItems) * 100 : 0;
  const successItems = processedItems - errorItems;

  return (
    <div className="space-y-3">
      {/* Barra de progresso visual */}
      <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
        <div
          className="bg-blue-600 h-2.5 transition-all duration-300 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Contadores */}
      <div className="flex items-center justify-between text-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <span className="text-gray-600">
              Processados: <strong className="text-gray-900">{processedItems}</strong> / {totalItems}
            </span>
            {errorItems > 0 && (
              <span className="text-red-600">
                Erros: <strong>{errorItems}</strong>
              </span>
            )}
            {successItems > 0 && errorItems === 0 && (
              <span className="text-green-600">
                Sucesso: <strong>{successItems}</strong>
              </span>
            )}
          </div>
          <div className="text-gray-500">
            {percentage.toFixed(0)}% concluído
          </div>
        </div>

        {/* Botão de cancelar */}
        {isCancellable && onCancel && (
          <Button onClick={onCancel} variant="outline" size="sm">
            Cancelar
          </Button>
        )}
      </div>
    </div>
  );
}