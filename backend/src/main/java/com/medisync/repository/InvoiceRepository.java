package com.medisync.repository;

import com.medisync.entity.Invoice;
import com.medisync.entity.StatutPaiement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface InvoiceRepository extends JpaRepository<Invoice, Long> {
    List<Invoice> findByPatientId(Long patientId);
    List<Invoice> findByStatut(StatutPaiement statut);
    Optional<Invoice> findByNumeroFacture(String numeroFacture);

    @Query("SELECT i FROM Invoice i WHERE i.patient.id = :patientId AND i.statut = 'IMPAYE'")
    List<Invoice> findUnpaidByPatientId(Long patientId);

    @Query("SELECT SUM(i.montantTotal) FROM Invoice i WHERE i.dateFacture BETWEEN :startDate AND :endDate")
    BigDecimal getTotalRevenueBetween(LocalDate startDate, LocalDate endDate);

    @Query("SELECT SUM(i.montantPaye) FROM Invoice i WHERE i.dateFacture BETWEEN :startDate AND :endDate")
    BigDecimal getTotalPaidBetween(LocalDate startDate, LocalDate endDate);

    List<Invoice> findByDateFactureBetweenOrderByDateFactureDesc(LocalDate start, LocalDate end);

    @Query("SELECT i FROM Invoice i ORDER BY i.dateFacture DESC")
    List<Invoice> findAllOrderByDateDesc();
}
