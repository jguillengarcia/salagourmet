import { useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import { format, startOfWeek, endOfWeek, isBefore, startOfToday } from 'date-fns';
import esLocale from 'date-fns/locale/es';
import ReservationModal from './ReservationModal';
import { useReservations } from '../context/ReservationContext';
import toast from 'react-hot-toast';
import { EventContentArg } from '@fullcalendar/core';

interface Reservation {
  id: string;
  portal: string;
  floor: string;
  door: string;
  date: string;
  status: 'confirmed';
}

export default function Calendar() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { reservations } = useReservations();

  const handleDateClick = (arg: { date: Date }) => {
    const today = startOfToday();
    const clickedDate = arg.date;
    
    const currentWeekStart = startOfWeek(today, { locale: esLocale });
    const currentWeekEnd = endOfWeek(currentWeekStart, { locale: esLocale });

    if (isBefore(clickedDate, today)) {
      toast.error('No se pueden hacer reservas en fechas pasadas');
      return;
    }

    if (isBefore(clickedDate, currentWeekStart) || isBefore(currentWeekEnd, clickedDate)) {
      toast.error('Solo se pueden hacer reservas para la semana actual');
      return;
    }

    const isDateReserved = reservations.some(
      reservation => reservation.date === format(clickedDate, 'yyyy-MM-dd')
    );

    if (isDateReserved) {
      toast.error('Esta fecha ya está reservada');
      return;
    }

    setSelectedDate(clickedDate);
    setIsModalOpen(true);
  };

  const getEventContent = (eventInfo: EventContentArg) => {
    const reservation = reservations.find(r => r.date === eventInfo.event.startStr) as Reservation;
    return {
      html: `<div class="p-1">
        <div class="font-semibold text-white text-xs sm:text-sm">Reservado</div>
        <div class="text-xs text-white">Portal ${reservation?.portal}, ${reservation?.floor}${reservation?.door}</div>
      </div>`
    };
  };

  return (
    <div className="bg-white rounded-lg shadow p-2 sm:p-6">
      <div className="mb-4 p-3 sm:p-4 bg-blue-50 rounded-lg">
        <h2 className="text-base sm:text-lg font-semibold text-blue-800 mb-2">Información importante</h2>
        <ul className="list-disc list-inside text-sm sm:text-base text-blue-700 space-y-1">
          <li>Solo se puede reservar para la semana actual (de lunes a domingo)</li>
          <li>Máximo 2 reservas por semana y por vivienda</li>
          <li>Las reservas mostrarán el portal y la vivienda del reservante</li>
        </ul>
      </div>

      <div className="fc-container">
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          locale="es"
          selectable={true}
          dateClick={handleDateClick}
          events={reservations.map(reservation => ({
            title: 'Reservado',
            date: reservation.date,
            backgroundColor: '#4F46E5',
            borderColor: '#4F46E5',
            className: 'reservation-event'
          }))}
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth'
          }}
          buttonText={{
            today: 'Hoy',
            month: 'Mes'
          }}
          eventContent={getEventContent}
          dayCellClassNames={(arg) => {
            const today = startOfToday();
            const currentWeekStart = startOfWeek(today, { locale: esLocale });
            const currentWeekEnd = endOfWeek(currentWeekStart, { locale: esLocale });
            
            if (isBefore(arg.date, currentWeekStart) || isBefore(currentWeekEnd, arg.date)) {
              return 'bg-gray-100 cursor-not-allowed opacity-50';
            }
            return '';
          }}
        />
      </div>
      
      {selectedDate && (
        <ReservationModal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          date={selectedDate}
          onSuccess={() => {
            setIsModalOpen(false);
            toast.success('Reserva realizada con éxito');
          }}
        />
      )}
    </div>
  );
}