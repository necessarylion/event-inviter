import '@adonisjs/inertia/types'

import type { VNodeProps, AllowedComponentProps, ComponentInstance } from 'vue'

type ExtractProps<T> = Omit<
  ComponentInstance<T>['$props'],
  keyof VNodeProps | keyof AllowedComponentProps
>

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'admin/templates/design': ExtractProps<(typeof import('../../inertia/pages/admin/templates/design.vue'))['default']>
    'admin/templates/index': ExtractProps<(typeof import('../../inertia/pages/admin/templates/index.vue'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.vue'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.vue'))['default']>
    'checkins/scan': ExtractProps<(typeof import('../../inertia/pages/checkins/scan.vue'))['default']>
    'dashboard/index': ExtractProps<(typeof import('../../inertia/pages/dashboard/index.vue'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.vue'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.vue'))['default']>
    'events/card_designer': ExtractProps<(typeof import('../../inertia/pages/events/card_designer.vue'))['default']>
    'events/create': ExtractProps<(typeof import('../../inertia/pages/events/create.vue'))['default']>
    'events/edit': ExtractProps<(typeof import('../../inertia/pages/events/edit.vue'))['default']>
    'events/show': ExtractProps<(typeof import('../../inertia/pages/events/show.vue'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.vue'))['default']>
    'settings/email': ExtractProps<(typeof import('../../inertia/pages/settings/email.vue'))['default']>
  }
}
