package com.bankofbagru.controller;

import com.bankofbagru.dto.ApiResponse;
import com.bankofbagru.entity.Branch;
import com.bankofbagru.service.BranchService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/branches")
public class BranchController {

    private final BranchService branchService;

    public BranchController(BranchService branchService) {
        this.branchService = branchService;
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<Branch>>> getAllBranches() {
        List<Branch> branches = branchService.getAllBranches();
        return ResponseEntity.ok(ApiResponse.success(branches, "Branches retrieved successfully"));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Branch>> getBranchById(@PathVariable Integer id) {
        Branch branch = branchService.getBranchById(id);
        return ResponseEntity.ok(ApiResponse.success(branch, "Branch retrieved successfully"));
    }

    @PostMapping
    public ResponseEntity<ApiResponse<Branch>> createBranch(@RequestBody Branch branch) {
        Branch created = branchService.createBranch(branch);
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(ApiResponse.success(created, "Branch registered successfully"));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Branch>> updateBranch(@PathVariable Integer id, @RequestBody Branch branch) {
        Branch updated = branchService.updateBranch(id, branch);
        return ResponseEntity.ok(ApiResponse.success(updated, "Branch updated successfully"));
    }
}
