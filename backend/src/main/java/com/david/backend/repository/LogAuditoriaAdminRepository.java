package com.david.backend.repository;

import com.david.backend.model.LogAuditoriaAdmin;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface LogAuditoriaAdminRepository extends JpaRepository<LogAuditoriaAdmin, Long> {
    List<LogAuditoriaAdmin> findAllByOrderByFechaAccionDesc();
}
