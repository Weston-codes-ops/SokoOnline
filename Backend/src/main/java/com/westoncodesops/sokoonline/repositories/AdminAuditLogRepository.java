package com.westoncodesops.sokoonline.repositories;

import com.westoncodesops.sokoonline.entities.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
}
