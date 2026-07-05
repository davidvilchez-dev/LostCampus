package com.david.backend.repository;

import com.david.backend.model.LogAuditoriaAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface LogAuditoriaAdminRepository extends JpaRepository<LogAuditoriaAdmin, Long> {
    List<LogAuditoriaAdmin> findAllByOrderByFechaAccionDesc();
}
