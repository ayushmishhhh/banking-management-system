package com.bankofbagru.service;

import com.bankofbagru.entity.Branch;
import com.bankofbagru.exception.BankingBusinessException;
import com.bankofbagru.exception.ResourceNotFoundException;
import com.bankofbagru.repository.BranchRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class BranchService {

    private final BranchRepository branchRepository;

    public BranchService(BranchRepository branchRepository) {
        this.branchRepository = branchRepository;
    }

    public List<Branch> getAllBranches() {
        return branchRepository.findAll();
    }

    public Branch getBranchById(Integer id) {
        return branchRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Branch not found with ID: " + id));
    }

    @Transactional
    public Branch createBranch(Branch branch) {
        if (branchRepository.existsByIfscCode(branch.getIfscCode())) {
            throw new BankingBusinessException("A branch with IFSC code " + branch.getIfscCode() + " already exists.");
        }
        return branchRepository.save(branch);
    }

    @Transactional
    public Branch updateBranch(Integer id, Branch branchDetails) {
        Branch branch = getBranchById(id);
        if (!branch.getIfscCode().equalsIgnoreCase(branchDetails.getIfscCode()) &&
            branchRepository.existsByIfscCode(branchDetails.getIfscCode())) {
            throw new BankingBusinessException("A branch with IFSC code " + branchDetails.getIfscCode() + " already exists.");
        }

        branch.setBranchName(branchDetails.getBranchName());
        branch.setIfscCode(branchDetails.getIfscCode());
        branch.setBranchAddress(branchDetails.getBranchAddress());
        branch.setCity(branchDetails.getCity());
        branch.setState(branchDetails.getState());

        return branchRepository.save(branch);
    }
}
