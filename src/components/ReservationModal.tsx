import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservations } from '../context/ReservationContext';
import toast from 'react-hot-toast';

interface ReservationModalProps {
  isOpen: boolean;
  onClose: () => void;
  date: Date;
  onSuccess: () => void;
}

export default function ReservationModal({ isOpen, onClose, date, onSuccess }: ReservationModalProps) {
  const [portal, setPortal] = useState('');
  const [floor, setFloor] = useState('');
  const [door, setDoor] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { createReservation, getWeeklyApartmentReservationsCount } = useReservations();

  const resetForm = () => {
    setPortal('');
    setFloor('');
    setDoor('');
    setIsLoading(false);
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!['1', '2', '3'].includes(portal)) {
      toast.error('El portal debe ser 1, 2 o 3');
      return;
    }

    const floorNum = parseInt(floor);
    if (floorNum < 1 || floorNum > 10) {
      toast.error('El piso debe estar entre 1 y 10');
      return;
    }

    if (!['A', 'B'].includes(door.toUpperCase())) {
      toast.error('La puerta debe ser A o B');
      return;
    }

    const formattedDate = format(date, 'yyyy-MM-dd');
    const weeklyReservationsCount = getWeeklyApartmentReservationsCount(portal, floor, door, formattedDate);
    
    if (weeklyReservationsCount >= 2) {
      toast.error('Esta vivienda ya ha alcanzado el límite de 2 reservas esta semana');
      return;
    }

    setIsLoading(true);

    try {
      const reservationData = {
        portal,
        floor,
        door: door.toUpperCase(),
        date: formattedDate,
        status: 'confirmed' as const
      };

      await createReservation(reservationData);
      onSuccess();
    } catch (error: any) {
      console.error('Error al procesar la reserva:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-base font-semibold leading-6 text-gray-900">
                      Reservar Sala Gourmet
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Fecha seleccionada: {format(date, "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit} className="mt-5 sm:mt-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label htmlFor="portal" className="block text-sm font-medium text-gray-700">
                          Portal
                        </label>
                        <select
                          id="portal"
                          value={portal}
                          onChange={(e) => setPortal(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Seleccionar</option>
                          <option value="1">1</option>
                          <option value="2">2</option>
                          <option value="3">3</option>
                        </select>
                      </div>
                      <div>
                        <label htmlFor="floor" className="block text-sm font-medium text-gray-700">
                          Piso
                        </label>
                        <select
                          id="floor"
                          value={floor}
                          onChange={(e) => setFloor(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Seleccionar</option>
                          {[...Array(10)].map((_, i) => (
                            <option key={i + 1} value={i + 1}>{i + 1}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label htmlFor="door" className="block text-sm font-medium text-gray-700">
                          Puerta
                        </label>
                        <select
                          id="door"
                          value={door}
                          onChange={(e) => setDoor(e.target.value)}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          required
                        >
                          <option value="">Seleccionar</option>
                          <option value="A">A</option>
                          <option value="B">B</option>
                        </select>
                      </div>
                    </div>

                    <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 sm:col-start-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {isLoading ? 'Procesando...' : 'Reservar'}
                      </button>
                      <button
                        type="button"
                        onClick={handleClose}
                        disabled={isLoading}
                        className="mt-3 inline-flex w-full justify-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:col-start-1 sm:mt-0 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Cancelar
                      </button>
                    </div>
                  </form>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}