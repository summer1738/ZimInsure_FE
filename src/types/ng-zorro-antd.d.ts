// Type declarations for ng-zorro-antd modules
declare module 'ng-zorro-antd/message' {
  import { Injectable } from '@angular/core';
  
  @Injectable({
    providedIn: 'root'
  })
  export class NzMessageService {
    success(message: string): void;
    error(message: string): void;
    warning(message: string): void;
    info(message: string): void;
  }
}

declare module 'ng-zorro-antd/modal' {
  import { Injectable } from '@angular/core';
  
  @Injectable({
    providedIn: 'root'
  })
  export class NzModalService {
    create(options: any): any;
    confirm(options: any): any;
    info(options: any): any;
    success(options: any): any;
    warning(options: any): any;
    error(options: any): any;
  }
  
  export class NzModalModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/icon' {
  export class NzIconModule {
    static forRoot(): any;
  }
  export function provideNzIcons(icons?: any): any;
}

declare module 'ng-zorro-antd/layout' {
  export class NzLayoutModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/menu' {
  export class NzMenuModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/form' {
  export class NzFormModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/input' {
  export class NzInputModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/button' {
  export class NzButtonModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/checkbox' {
  export class NzCheckboxModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/table' {
  export class NzTableModule {
    static forRoot(): any;
  }
}

declare module 'ng-zorro-antd/i18n' {
  export const en_US: any;
  export function provideNzI18n(locale: any): any;
}
