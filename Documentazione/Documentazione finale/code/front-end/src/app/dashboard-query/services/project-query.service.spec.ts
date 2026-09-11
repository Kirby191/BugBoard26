import { TestBed } from '@angular/core/testing';
import { ProjectQueryService } from './project-query.service';

describe('ProjectQueryService', () => {
  let service: ProjectQueryService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ProjectQueryService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
