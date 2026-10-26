package com.bankofbagru.dto;

public class LoginResponse {
    private Integer userId;
    private String username;
    private String fullName;
    private String role;
    private Integer branchId;
    private String token;

    public LoginResponse() {}

    public LoginResponse(Integer userId, String username, String fullName, String role, Integer branchId, String token) {
        this.userId = userId;
        this.username = username;
        this.fullName = fullName;
        this.role = role;
        this.branchId = branchId;
        this.token = token;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getRole() {
        return role;
    }

    public void setRole(String role) {
        this.role = role;
    }

    public Integer getBranchId() {
        return branchId;
    }

    public void setBranchId(Integer branchId) {
        this.branchId = branchId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
