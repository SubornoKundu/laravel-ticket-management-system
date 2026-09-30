import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../wayfinder'
import messages from './messages'
/**
* @see \App\Http\Controllers\Admin\TicketController::index
 * @see app/Http/Controllers/Admin/TicketController.php:31
 * @route '/admin/tickets'
 */
export const index = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})

index.definition = {
    methods: ["get","head"],
    url: '/admin/tickets',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TicketController::index
 * @see app/Http/Controllers/Admin/TicketController.php:31
 * @route '/admin/tickets'
 */
index.url = (options?: RouteQueryOptions) => {
    return index.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TicketController::index
 * @see app/Http/Controllers/Admin/TicketController.php:31
 * @route '/admin/tickets'
 */
index.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: index.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\TicketController::index
 * @see app/Http/Controllers/Admin/TicketController.php:31
 * @route '/admin/tickets'
 */
index.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: index.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\TicketController::index
 * @see app/Http/Controllers/Admin/TicketController.php:31
 * @route '/admin/tickets'
 */
    const indexForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: index.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\TicketController::index
 * @see app/Http/Controllers/Admin/TicketController.php:31
 * @route '/admin/tickets'
 */
        indexForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: index.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\TicketController::index
 * @see app/Http/Controllers/Admin/TicketController.php:31
 * @route '/admin/tickets'
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
* @see \App\Http\Controllers\Admin\TicketController::status
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
export const status = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: status.url(args, options),
    method: 'patch',
})

status.definition = {
    methods: ["patch"],
    url: '/admin/tickets/{ticket}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\TicketController::status
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
status.url = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ticket: args }
    }

            if (typeof args === 'object' && !Array.isArray(args) && 'id' in args) {
            args = { ticket: args.id }
        }
    
    if (Array.isArray(args)) {
        args = {
                    ticket: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        ticket: typeof args.ticket === 'object'
                ? args.ticket.id
                : args.ticket,
                }

    return status.definition.url
            .replace('{ticket}', parsedArgs.ticket.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TicketController::status
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
status.patch = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: status.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\TicketController::status
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
    const statusForm = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: status.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\TicketController::status
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
        statusForm.patch = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: status.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    status.form = statusForm
const tickets = {
    index: Object.assign(index, index),
status: Object.assign(status, status),
messages: Object.assign(messages, messages),
}

export default tickets