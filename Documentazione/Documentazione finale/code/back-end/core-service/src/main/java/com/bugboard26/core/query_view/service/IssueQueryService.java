package com.bugboard26.core.query_view.service;

import com.bugboard26.core.history.dto.BugHistory;
import com.bugboard26.core.query_view.dto.IssueDetailed;
import com.bugboard26.core.query_view.dto.IssueFilter;
import com.bugboard26.core.query_view.dto.IssueSummary;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;

public interface IssueQueryService {

    Page<IssueSummary> searchIssues(IssueFilter filter, Pageable pageable);

    IssueDetailed getIssueById(Long id);

    //TODO: RIMOZIONE TOTALE DEL METODO PER CONFLITTO DI ROTTA
    //List<BugHistory> getBugHistory(Long issueId);
}
