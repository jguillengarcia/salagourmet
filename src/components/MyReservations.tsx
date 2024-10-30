import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { useReservations } from '../context/ReservationContext';
import { useAuth } from '../context/AuthContext';

export default function MyReservations() {
  const { reservations, cancelReservation } = useReservations();
  const { user } = useAuth();

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-lg">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">Reservas</h3>
        <p className="mt-1 max-w-2xl text-sm text-gray-500">
          Listado de todas las reservas realizadas
        </p>
      </div>
      <div className="border-t border-gray-200">
        {reservations.length === 0 ? (
          <div className="px-4 py-5 sm:p-6 text-center text-gray-500">
            No hay reservas registradas
          </div>
        ) : (
          <ul role="list" className="divide-y divide-gray-200">
            {reservations.map((reservation) => (
              <li key={reservation.id} className="px-4 py-4 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-gray-900">
                      {format(new Date(reservation.date), "EEEE d 'de' MMMM 'de' yyyy", { locale: es })}
                    </p>
                    <p className="text-sm text-gray-500">
                      Portal {reservation.portal}, {reservation.floor}{reservation.door}
                    </p>
                  </div>
                  {user && user.uid === reservation.userId && (
                    <button
                      onClick={() => cancelReservation(reservation.id)}
                      className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}