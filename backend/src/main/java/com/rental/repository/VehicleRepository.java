package com.rental.repository;

import com.rental.model.Vehicle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.math.BigDecimal;
import java.util.List;

public interface VehicleRepository extends JpaRepository<Vehicle, Long> {
    List<Vehicle> findByAvailableTrue();
    List<Vehicle> findByTypeContainingIgnoreCase(String type);
    List<Vehicle> findByBrandContainingIgnoreCase(String brand);

    @Query("SELECT v FROM Vehicle v WHERE " +
           "(:search IS NULL OR LOWER(v.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           "OR LOWER(v.brand) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:type IS NULL OR v.type = :type) " +
           "AND (:maxPrice IS NULL OR v.pricePerDay <= :maxPrice) " +
           "AND (:available IS NULL OR v.available = :available)")
    List<Vehicle> searchVehicles(
        @Param("search") String search,
        @Param("type") String type,
        @Param("maxPrice") BigDecimal maxPrice,
        @Param("available") Boolean available
    );
}
