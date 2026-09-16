package com.bugboard26.core.query_view.service;

import com.bugboard26.core.query_view.dto.IssueDetailed;
import com.bugboard26.core.query_view.dto.IssueFilter;
import com.bugboard26.core.query_view.dto.IssueSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface IssueQueryService {

    Page<IssueSummary> searchIssues(IssueFilter filter, Pageable pageable);

    IssueDetailed getIssueById(Long id);
}
