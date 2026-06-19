package com.rental.repository;

import com.rental.model.Booking;
import com.rental.model.Booking.BookingStatus;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDate;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @EntityGraph(attributePaths = {"user", "vehicle"})
    List<Booking> findByUserIdOrderByCreatedAtDesc(Long userId);

    @EntityGraph(attributePaths = {"user", "vehicle"})
    List<Booking> findByStatus(BookingStatus status);

    @EntityGraph(attributePaths = {"user", "vehicle"})
    List<Booking> findAllByOrderByCreatedAtDesc();

    @Query("SELECT COUNT(b) FROM Booking b WHERE b.vehicle.id = :vehicleId AND b.status = 'CONFIRMED' " +
           "AND ((b.startDate BETWEEN :start AND :end) OR (b.endDate BETWEEN :start AND :end) " +
           "OR (:start BETWEEN b.startDate AND b.endDate))")
    long countConflictingBookings(
        @Param("vehicleId") Long vehicleId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    long countByStatus(BookingStatus status);
}
