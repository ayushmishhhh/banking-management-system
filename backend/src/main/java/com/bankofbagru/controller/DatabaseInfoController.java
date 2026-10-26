package com.bankofbagru.controller;

import com.bankofbagru.dto.ApiResponse;
import com.bankofbagru.service.DatabaseInfoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/database-info")
public class DatabaseInfoController {

    private final DatabaseInfoService databaseInfoService;

    public DatabaseInfoController(DatabaseInfoService databaseInfoService) {
        this.databaseInfoService = databaseInfoService;
    }

    @GetMapping("/schema")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getSchemaOverview() {
        Map<String, Object> schema = databaseInfoService.getDatabaseSchemaOverview();
        return ResponseEntity.ok(ApiResponse.success(schema, "Database schema and live metrics retrieved"));
    }

    @GetMapping("/demo-query")
    public ResponseEntity<ApiResponse<Map<String, Object>>> executeDemoQuery(@RequestParam(defaultValue = "JOIN_ACCOUNTS_CUSTOMERS_BRANCHES") String key) {
        Map<String, Object> result = databaseInfoService.executeDemonstrationQuery(key);
        return ResponseEntity.ok(ApiResponse.success(result, "Demonstration SQL executed successfully"));
    }
}
