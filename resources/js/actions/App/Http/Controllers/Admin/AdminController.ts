import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:25
 * @route '/admin/admins'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/admins',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:25
 * @route '/admin/admins'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:25
 * @route '/admin/admins'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:25
 * @route '/admin/admins'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:25
 * @route '/admin/admins'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:25
 * @route '/admin/admins'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\AdminController::index
 * @see app/Http/Controllers/Admin/AdminController.php:25
 * @route '/admin/admins'
 */
        indexForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    index.form = indexForm
/**
* @see \App\Http\Controllers\Admin\AdminController::store
 * @see app/Http/Controllers/Admin/AdminController.php:38
 * @route '/admin/admins'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/admin/admins',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::store
 * @see app/Http/Controllers/Admin/AdminController.php:38
 * @route '/admin/admins'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::store
 * @see app/Http/Controllers/Admin/AdminController.php:38
 * @route '/admin/admins'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::store
 * @see app/Http/Controllers/Admin/AdminController.php:38
 * @route '/admin/admins'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::store
 * @see app/Http/Controllers/Admin/AdminController.php:38
 * @route '/admin/admins'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
 * @see app/Http/Controllers/Admin/AdminController.php:63
 * @route '/admin/admins/{admin}'
 */
export const destroy = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

destroy.definition = {
    methods: ["delete"],
    url: '/admin/admins/{admin}',
} satisfies RouteDefinition<["delete"]>

/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
 * @see app/Http/Controllers/Admin/AdminController.php:63
 * @route '/admin/admins/{admin}'
 */
destroy.url = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { admin: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { admin: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    admin: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        admin: typeof args.admin === 'object'
                ? args.admin.id
                : args.admin,
                }

    return destroy.definition.url
            .replace('{admin}', parsedArgs.admin.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\AdminController::destroy
 * @see app/Http/Controllers/Admin/AdminController.php:63
 * @route '/admin/admins/{admin}'
 */
destroy.delete = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'delete'> => ({
    url: destroy.url(args, options),
    method: 'delete',
})

    /**
* @see \App\Http\Controllers\Admin\AdminController::destroy
 * @see app/Http/Controllers/Admin/AdminController.php:63
 * @route '/admin/admins/{admin}'
 */
    const destroyForm = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: destroy.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'DELETE',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\AdminController::destroy
 * @see app/Http/Controllers/Admin/AdminController.php:63
 * @route '/admin/admins/{admin}'
 */
        destroyForm.delete = (args: { admin: number | { id: number } } | [admin: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: destroy.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'DELETE',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    destroy.form = destroyForm
const AdminController = { index, store, destroy }

export default AdminController