import { Injector, runInInjectionContext } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Router } from '@angular/router';
import { DevModeService } from './dev-mode.service';

describe('DevModeService', () => {
  let service: DevModeService;
  let mockRouter: any;
  let mockDocument: any;
  let mockWindow: any;

  function createService(): DevModeService {
    const injector = Injector.create({
      providers: [
        { provide: DOCUMENT, useValue: mockDocument },
        { provide: Router, useValue: mockRouter },
      ],
    });
    return runInInjectionContext(injector, () => new DevModeService());
  }

  beforeEach(() => {
    mockWindow = {
      __DEV_MODE__: undefined,
      setDevMode: undefined,
    };

    mockDocument = {
      location: { search: '?dev=true' },
      defaultView: mockWindow,
    };

    mockRouter = {
      events: {
        pipe: () => ({ subscribe: () => {} }),
      },
      navigate: (commands: any[], options: any) => Promise.resolve(true),
    };
  });

  it('should initialize and attach console helpers to window', () => {
    service = createService();
    expect(typeof mockWindow.__DEV_MODE__).toBe('function');
    expect(typeof mockWindow.setDevMode).toBe('function');
  });

  it('should enable dev mode when dev=true is in URL', () => {
    mockDocument.location.search = '?dev=true';
    service = createService();
    expect(service.isDevMode()).toBeTruthy();
    expect(mockWindow.__DEV_MODE__()).toBeTruthy();
  });

  it('should disable dev mode when dev=false is in URL', () => {
    mockDocument.location.search = '?dev=false';
    service = createService();
    expect(service.isDevMode()).toBeFalsy();
  });

  it('should update dev mode and navigate with query parameters when setDevMode is called', () => {
    let navigatedOptions: any = null;
    mockRouter.navigate = (cmds: any[], options: any) => {
      navigatedOptions = options;
      return Promise.resolve(true);
    };

    mockDocument.location.search = '';
    service = createService();
    service.setDevMode(true);

    expect(service.isDevMode()).toBeTruthy();
    expect(navigatedOptions).toBeDefined();
    expect(navigatedOptions.queryParams.dev).toBe('true');
    expect(navigatedOptions.queryParamsHandling).toBe('merge');

    service.setDevMode(false);
    expect(service.isDevMode()).toBeFalsy();
    expect(navigatedOptions.queryParams.dev).toBeNull();
  });
});
