package com.medisync.repository;

import com.medisync.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findByUserId(Long userId);
    List<AuditLog> findByEntiteAndEntiteId(String entite, Long entiteId);
    List<AuditLog> findByTimestampBetween(LocalDateTime start, LocalDateTime end);
    List<AuditLog> findAllByOrderByTimestampDesc();
    List<AuditLog> findByActionOrderByTimestampDesc(String action);
    List<AuditLog> findByActionAndTimestampBetweenOrderByTimestampDesc(String action, LocalDateTime start, LocalDateTime end);
    List<AuditLog> findByTimestampBetweenOrderByTimestampDesc(LocalDateTime start, LocalDateTime end);
}
