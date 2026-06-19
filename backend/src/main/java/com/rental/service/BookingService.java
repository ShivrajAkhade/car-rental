package com.rental.service;

import com.rental.dto.ApiResponse;
import com.rental.dto.BookingRequest;
import com.rental.model.Booking;
import com.rental.model.Booking.BookingStatus;
import com.rental.model.User;
import com.rental.model.Vehicle;
import com.rental.repository.BookingRepository;
import com.rental.repository.UserRepository;
import com.rental.repository.VehicleRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

@Service
public class BookingService {

    private final BookingRepository bookingRepository;
    private final VehicleRepository vehicleRepository;
    private final UserRepository userRepository;

    public BookingService(BookingRepository bookingRepository,
                          VehicleRepository vehicleRepository,
                          UserRepository userRepository) {
        this.bookingRepository = bookingRepository;
        this.vehicleRepository = vehicleRepository;
        this.userRepository = userRepository;
    }

    @Transactional
    public ApiResponse<?> createBooking(Long userId, BookingRequest request) {
        if (request.getStartDate().isAfter(request.getEndDate())) {
            return ApiResponse.error("Start date must be before end date");
        }

        Vehicle vehicle = vehicleRepository.findById(request.getVehicleId())
                .orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found");
        }

        if (!vehicle.isAvailable()) {
            return ApiResponse.error("Vehicle is not available");
        }

        long conflicts = bookingRepository.countConflictingBookings(
                request.getVehicleId(), request.getStartDate(), request.getEndDate());
        if (conflicts > 0) {
            return ApiResponse.error("Vehicle is already booked for these dates");
        }

        User user = userRepository.findById(userId)
                .orElse(null);
        if (user == null) {
            return ApiResponse.error("User not found");
        }

        long days = ChronoUnit.DAYS.between(request.getStartDate(), request.getEndDate());
        BigDecimal totalPrice = vehicle.getPricePerDay().multiply(BigDecimal.valueOf(days));

        Booking booking = new Booking();
        booking.setUser(user);
        booking.setVehicle(vehicle);
        booking.setStartDate(request.getStartDate());
        booking.setEndDate(request.getEndDate());
        booking.setTotalPrice(totalPrice);
        booking.setStatus(BookingStatus.PENDING);

        Booking saved = bookingRepository.save(booking);

        return ApiResponse.success("Booking created successfully", saved);
    }

    public ApiResponse<List<Booking>> getUserBookings(Long userId) {
        List<Booking> bookings = bookingRepository.findByUserIdOrderByCreatedAtDesc(userId);
        return ApiResponse.success("Bookings retrieved", bookings);
    }

    public ApiResponse<Booking> getBookingById(Long bookingId, Long userId) {
        return bookingRepository.findById(bookingId)
                .filter(b -> b.getUser().getId().equals(userId))
                .map(booking -> ApiResponse.success("Booking retrieved", booking))
                .orElse(ApiResponse.error("Booking not found"));
    }

    @Transactional
    public ApiResponse<?> cancelBooking(Long bookingId, Long userId) {
        return bookingRepository.findById(bookingId)
                .filter(b -> b.getUser().getId().equals(userId))
                .map(booking -> {
                    if (booking.getStatus() == BookingStatus.CANCELLED) {
                        return ApiResponse.error("Booking is already cancelled");
                    }
                    booking.setStatus(BookingStatus.CANCELLED);
                    bookingRepository.save(booking);
                    return ApiResponse.success("Booking cancelled successfully");
                })
                .orElse(ApiResponse.error("Booking not found"));
    }

    public List<Booking> getAllBookings() {
        return bookingRepository.findAllByOrderByCreatedAtDesc();
    }

    @Transactional
    public ApiResponse<?> updateBookingStatus(Long bookingId, BookingStatus status) {
        return bookingRepository.findById(bookingId)
                .map(booking -> {
                    booking.setStatus(status);
                    bookingRepository.save(booking);
                    return ApiResponse.success("Booking status updated to " + status);
                })
                .orElse(ApiResponse.error("Booking not found"));
    }

    public long getBookingCountByStatus(BookingStatus status) {
        return bookingRepository.countByStatus(status);
    }
}
