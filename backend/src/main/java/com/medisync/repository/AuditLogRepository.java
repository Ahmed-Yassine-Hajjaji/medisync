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
}
