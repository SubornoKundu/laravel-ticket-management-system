import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../../wayfinder'
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
* @see \App\Http\Controllers\Admin\TicketController::updateStatus
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
export const updateStatus = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

updateStatus.definition = {
    methods: ["patch"],
    url: '/admin/tickets/{ticket}/status',
} satisfies RouteDefinition<["patch"]>

/**
* @see \App\Http\Controllers\Admin\TicketController::updateStatus
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
updateStatus.url = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return updateStatus.definition.url
            .replace('{ticket}', parsedArgs.ticket.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TicketController::updateStatus
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
updateStatus.patch = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'patch'> => ({
    url: updateStatus.url(args, options),
    method: 'patch',
})

    /**
* @see \App\Http\Controllers\Admin\TicketController::updateStatus
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
    const updateStatusForm = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: updateStatus.url(args, {
                    [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                        _method: 'PATCH',
                        ...(options?.query ?? options?.mergeQuery ?? {}),
                    }
                }),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\TicketController::updateStatus
 * @see app/Http/Controllers/Admin/TicketController.php:87
 * @route '/admin/tickets/{ticket}/status'
 */
        updateStatusForm.patch = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: updateStatus.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'PATCH',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'post',
        })
    
    updateStatus.form = updateStatusForm
/**
* @see \App\Http\Controllers\Admin\TicketController::messages
 * @see app/Http/Controllers/Admin/TicketController.php:114
 * @route '/admin/tickets/{ticket}/messages'
 */
export const messages = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/admin/tickets/{ticket}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\Admin\TicketController::messages
 * @see app/Http/Controllers/Admin/TicketController.php:114
 * @route '/admin/tickets/{ticket}/messages'
 */
messages.url = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return messages.definition.url
            .replace('{ticket}', parsedArgs.ticket.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TicketController::messages
 * @see app/Http/Controllers/Admin/TicketController.php:114
 * @route '/admin/tickets/{ticket}/messages'
 */
messages.get = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\Admin\TicketController::messages
 * @see app/Http/Controllers/Admin/TicketController.php:114
 * @route '/admin/tickets/{ticket}/messages'
 */
messages.head = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\Admin\TicketController::messages
 * @see app/Http/Controllers/Admin/TicketController.php:114
 * @route '/admin/tickets/{ticket}/messages'
 */
    const messagesForm = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\Admin\TicketController::messages
 * @see app/Http/Controllers/Admin/TicketController.php:114
 * @route '/admin/tickets/{ticket}/messages'
 */
        messagesForm.get = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\Admin\TicketController::messages
 * @see app/Http/Controllers/Admin/TicketController.php:114
 * @route '/admin/tickets/{ticket}/messages'
 */
        messagesForm.head = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    messages.form = messagesForm
/**
* @see \App\Http\Controllers\Admin\TicketController::sendMessage
 * @see app/Http/Controllers/Admin/TicketController.php:128
 * @route '/admin/tickets/{ticket}/messages'
 */
export const sendMessage = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(args, options),
    method: 'post',
})

sendMessage.definition = {
    methods: ["post"],
    url: '/admin/tickets/{ticket}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\Admin\TicketController::sendMessage
 * @see app/Http/Controllers/Admin/TicketController.php:128
 * @route '/admin/tickets/{ticket}/messages'
 */
sendMessage.url = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions) => {
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

    return sendMessage.definition.url
            .replace('{ticket}', parsedArgs.ticket.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\Admin\TicketController::sendMessage
 * @see app/Http/Controllers/Admin/TicketController.php:128
 * @route '/admin/tickets/{ticket}/messages'
 */
sendMessage.post = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\Admin\TicketController::sendMessage
 * @see app/Http/Controllers/Admin/TicketController.php:128
 * @route '/admin/tickets/{ticket}/messages'
 */
    const sendMessageForm = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sendMessage.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\Admin\TicketController::sendMessage
 * @see app/Http/Controllers/Admin/TicketController.php:128
 * @route '/admin/tickets/{ticket}/messages'
 */
        sendMessageForm.post = (args: { ticket: number | { id: number } } | [ticket: number | { id: number } ] | number | { id: number }, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sendMessage.url(args, options),
            method: 'post',
        })
    
    sendMessage.form = sendMessageForm
const TicketController = { index, updateStatus, messages, sendMessage }

export default TicketController