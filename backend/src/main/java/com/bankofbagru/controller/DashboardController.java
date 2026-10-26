package com.bankofbagru.controller;

import com.bankofbagru.dto.ApiResponse;
import com.bankofbagru.dto.DashboardStatsDto;
import com.bankofbagru.service.DashboardService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final DashboardService dashboardService;

    public DashboardController(DashboardService dashboardService) {
        this.dashboardService = dashboardService;
    }

    @GetMapping("/stats")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getDashboardStats() {
        DashboardStatsDto stats = dashboardService.getLiveDashboardStatistics();
        return ResponseEntity.ok(ApiResponse.success(stats, "Live banking statistics retrieved successfully"));
    }
}
