package com.bankofbagru.repository;

import com.bankofbagru.entity.Branch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface BranchRepository extends JpaRepository<Branch, Integer> {
    Optional<Branch> findByIfscCode(String ifscCode);
    boolean existsByIfscCode(String ifscCode);
}
