import { queryParams, type RouteQueryOptions, type RouteDefinition, type RouteFormDefinition, applyUrlDefaults } from './../../../../wayfinder'
/**
* @see \App\Http\Controllers\TicketController::create
 * @see app/Http/Controllers/TicketController.php:20
 * @route '/tickets/create'
 */
export const create = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})

create.definition = {
    methods: ["get","head"],
    url: '/tickets/create',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TicketController::create
 * @see app/Http/Controllers/TicketController.php:20
 * @route '/tickets/create'
 */
create.url = (options?: RouteQueryOptions) => {
    return create.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TicketController::create
 * @see app/Http/Controllers/TicketController.php:20
 * @route '/tickets/create'
 */
create.get = (options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: create.url(options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TicketController::create
 * @see app/Http/Controllers/TicketController.php:20
 * @route '/tickets/create'
 */
create.head = (options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: create.url(options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TicketController::create
 * @see app/Http/Controllers/TicketController.php:20
 * @route '/tickets/create'
 */
    const createForm = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: create.url(options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TicketController::create
 * @see app/Http/Controllers/TicketController.php:20
 * @route '/tickets/create'
 */
        createForm.get = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url(options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TicketController::create
 * @see app/Http/Controllers/TicketController.php:20
 * @route '/tickets/create'
 */
        createForm.head = (options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: create.url({
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    create.form = createForm
/**
* @see \App\Http\Controllers\TicketController::store
 * @see app/Http/Controllers/TicketController.php:29
 * @route '/tickets'
 */
export const store = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

store.definition = {
    methods: ["post"],
    url: '/tickets',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TicketController::store
 * @see app/Http/Controllers/TicketController.php:29
 * @route '/tickets'
 */
store.url = (options?: RouteQueryOptions) => {
    return store.definition.url + queryParams(options)
}

/**
* @see \App\Http\Controllers\TicketController::store
 * @see app/Http/Controllers/TicketController.php:29
 * @route '/tickets'
 */
store.post = (options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: store.url(options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TicketController::store
 * @see app/Http/Controllers/TicketController.php:29
 * @route '/tickets'
 */
    const storeForm = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: store.url(options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TicketController::store
 * @see app/Http/Controllers/TicketController.php:29
 * @route '/tickets'
 */
        storeForm.post = (options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: store.url(options),
            method: 'post',
        })
    
    store.form = storeForm
/**
* @see \App\Http\Controllers\TicketController::confirmation
 * @see app/Http/Controllers/TicketController.php:98
 * @route '/tickets/confirmation/{ticketUid}'
 */
export const confirmation = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirmation.url(args, options),
    method: 'get',
})

confirmation.definition = {
    methods: ["get","head"],
    url: '/tickets/confirmation/{ticketUid}',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TicketController::confirmation
 * @see app/Http/Controllers/TicketController.php:98
 * @route '/tickets/confirmation/{ticketUid}'
 */
confirmation.url = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ticketUid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    ticketUid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        ticketUid: args.ticketUid,
                }

    return confirmation.definition.url
            .replace('{ticketUid}', parsedArgs.ticketUid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TicketController::confirmation
 * @see app/Http/Controllers/TicketController.php:98
 * @route '/tickets/confirmation/{ticketUid}'
 */
confirmation.get = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: confirmation.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TicketController::confirmation
 * @see app/Http/Controllers/TicketController.php:98
 * @route '/tickets/confirmation/{ticketUid}'
 */
confirmation.head = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: confirmation.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TicketController::confirmation
 * @see app/Http/Controllers/TicketController.php:98
 * @route '/tickets/confirmation/{ticketUid}'
 */
    const confirmationForm = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: confirmation.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TicketController::confirmation
 * @see app/Http/Controllers/TicketController.php:98
 * @route '/tickets/confirmation/{ticketUid}'
 */
        confirmationForm.get = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: confirmation.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TicketController::confirmation
 * @see app/Http/Controllers/TicketController.php:98
 * @route '/tickets/confirmation/{ticketUid}'
 */
        confirmationForm.head = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: confirmation.url(args, {
                        [options?.mergeQuery ? 'mergeQuery' : 'query']: {
                            _method: 'HEAD',
                            ...(options?.query ?? options?.mergeQuery ?? {}),
                        }
                    }),
            method: 'get',
        })
    
    confirmation.form = confirmationForm
/**
* @see \App\Http\Controllers\TicketController::cancel
 * @see app/Http/Controllers/TicketController.php:123
 * @route '/tickets/confirmation/{ticketUid}/cancel'
 */
export const cancel = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

cancel.definition = {
    methods: ["post"],
    url: '/tickets/confirmation/{ticketUid}/cancel',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TicketController::cancel
 * @see app/Http/Controllers/TicketController.php:123
 * @route '/tickets/confirmation/{ticketUid}/cancel'
 */
cancel.url = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ticketUid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    ticketUid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        ticketUid: args.ticketUid,
                }

    return cancel.definition.url
            .replace('{ticketUid}', parsedArgs.ticketUid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TicketController::cancel
 * @see app/Http/Controllers/TicketController.php:123
 * @route '/tickets/confirmation/{ticketUid}/cancel'
 */
cancel.post = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: cancel.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TicketController::cancel
 * @see app/Http/Controllers/TicketController.php:123
 * @route '/tickets/confirmation/{ticketUid}/cancel'
 */
    const cancelForm = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: cancel.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TicketController::cancel
 * @see app/Http/Controllers/TicketController.php:123
 * @route '/tickets/confirmation/{ticketUid}/cancel'
 */
        cancelForm.post = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: cancel.url(args, options),
            method: 'post',
        })
    
    cancel.form = cancelForm
/**
* @see \App\Http\Controllers\TicketController::messages
 * @see app/Http/Controllers/TicketController.php:150
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
export const messages = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})

messages.definition = {
    methods: ["get","head"],
    url: '/tickets/confirmation/{ticketUid}/messages',
} satisfies RouteDefinition<["get","head"]>

/**
* @see \App\Http\Controllers\TicketController::messages
 * @see app/Http/Controllers/TicketController.php:150
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
messages.url = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ticketUid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    ticketUid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        ticketUid: args.ticketUid,
                }

    return messages.definition.url
            .replace('{ticketUid}', parsedArgs.ticketUid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TicketController::messages
 * @see app/Http/Controllers/TicketController.php:150
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
messages.get = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'get'> => ({
    url: messages.url(args, options),
    method: 'get',
})
/**
* @see \App\Http\Controllers\TicketController::messages
 * @see app/Http/Controllers/TicketController.php:150
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
messages.head = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'head'> => ({
    url: messages.url(args, options),
    method: 'head',
})

    /**
* @see \App\Http\Controllers\TicketController::messages
 * @see app/Http/Controllers/TicketController.php:150
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
    const messagesForm = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
        action: messages.url(args, options),
        method: 'get',
    })

            /**
* @see \App\Http\Controllers\TicketController::messages
 * @see app/Http/Controllers/TicketController.php:150
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
        messagesForm.get = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
            action: messages.url(args, options),
            method: 'get',
        })
            /**
* @see \App\Http\Controllers\TicketController::messages
 * @see app/Http/Controllers/TicketController.php:150
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
        messagesForm.head = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'get'> => ({
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
* @see \App\Http\Controllers\TicketController::sendMessage
 * @see app/Http/Controllers/TicketController.php:172
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
export const sendMessage = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(args, options),
    method: 'post',
})

sendMessage.definition = {
    methods: ["post"],
    url: '/tickets/confirmation/{ticketUid}/messages',
} satisfies RouteDefinition<["post"]>

/**
* @see \App\Http\Controllers\TicketController::sendMessage
 * @see app/Http/Controllers/TicketController.php:172
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
sendMessage.url = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions) => {
    if (typeof args === 'string' || typeof args === 'number') {
        args = { ticketUid: args }
    }

    
    if (Array.isArray(args)) {
        args = {
                    ticketUid: args[0],
                }
    }

    args = applyUrlDefaults(args)

    const parsedArgs = {
                        ticketUid: args.ticketUid,
                }

    return sendMessage.definition.url
            .replace('{ticketUid}', parsedArgs.ticketUid.toString())
            .replace(/\/+$/, '') + queryParams(options)
}

/**
* @see \App\Http\Controllers\TicketController::sendMessage
 * @see app/Http/Controllers/TicketController.php:172
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
sendMessage.post = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteDefinition<'post'> => ({
    url: sendMessage.url(args, options),
    method: 'post',
})

    /**
* @see \App\Http\Controllers\TicketController::sendMessage
 * @see app/Http/Controllers/TicketController.php:172
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
    const sendMessageForm = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
        action: sendMessage.url(args, options),
        method: 'post',
    })

            /**
* @see \App\Http\Controllers\TicketController::sendMessage
 * @see app/Http/Controllers/TicketController.php:172
 * @route '/tickets/confirmation/{ticketUid}/messages'
 */
        sendMessageForm.post = (args: { ticketUid: string | number } | [ticketUid: string | number ] | string | number, options?: RouteQueryOptions): RouteFormDefinition<'post'> => ({
            action: sendMessage.url(args, options),
            method: 'post',
        })
    
    sendMessage.form = sendMessageForm
const TicketController = { create, store, confirmation, cancel, messages, sendMessage }

export default TicketController