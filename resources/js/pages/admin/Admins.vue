<script setup lang="ts">
import { Head, router, useForm, usePage } from '@inertiajs/vue3';
import { Trash2 } from '@lucide/vue';
import AdminController from '@/actions/App/Http/Controllers/Admin/AdminController';
import InputError from '@/components/InputError.vue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { index as adminAdminsIndex } from '@/routes/admin/admins';
import { formatDate } from '@/lib/ticketFormat';
import type { User } from '@/types/auth';

defineProps<{
    admins: User[];
}>();

defineOptions({
    layout: {
        breadcrumbs: [{ title: 'Admins', href: adminAdminsIndex() }],
    },
});

const page = usePage();
const currentUserId = page.props.auth.user.id;

const form = useForm({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
});

function submit() {
    form.post(AdminController.store.url(), {
        preserveScroll: true,
        onSuccess: () => form.reset(),
    });
}

function removeAdmin(admin: User) {
    if (!confirm(`Remove ${admin.name} as admin? This deletes their account.`)) return;

    router.delete(AdminController.destroy.url(admin.id), { preserveScroll: true });
}
</script>

<template>
    <Head title="Admins" />

    <div class="flex flex-1 flex-col gap-5 p-4">
        <h1 class="text-xl font-semibold">Admin Accounts</h1>

        <div class="grid gap-5 lg:grid-cols-3">
            <div class="rounded-xl border bg-card lg:col-span-2">
                <table class="w-full text-sm">
                    <thead class="bg-muted/50">
                        <tr class="text-left text-muted-foreground">
                            <th class="px-4 py-3 font-medium">Name</th>
                            <th class="px-4 py-3 font-medium">Email</th>
                            <th class="px-4 py-3 font-medium">Added</th>
                            <th class="px-4 py-3"></th>
                        </tr>
                    </thead>
                    <tbody class="divide-y">
                        <tr v-for="admin in admins" :key="admin.id">
                            <td class="px-4 py-3 font-medium">
                                {{ admin.name }}
                                <span v-if="admin.id === currentUserId" class="ml-1 text-xs text-muted-foreground">(you)</span>
                            </td>
                            <td class="px-4 py-3 break-all text-muted-foreground">{{ admin.email }}</td>
                            <td class="px-4 py-3 text-muted-foreground">{{ formatDate(admin.created_at) }}</td>
                            <td class="px-4 py-3 text-right">
                                <Button
                                    v-if="admin.id !== currentUserId && admins.length > 1"
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    aria-label="Remove admin"
                                    @click="removeAdmin(admin)"
                                >
                                    <Trash2 class="size-4 text-destructive" />
                                </Button>
                            </td>
                        </tr>
                        <tr v-if="admins.length === 0">
                            <td colspan="4" class="px-4 py-10 text-center text-muted-foreground">No admins found.</td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <form class="h-fit space-y-4 rounded-xl border bg-card p-5" @submit.prevent="submit">
                <h2 class="font-medium">Add admin</h2>

                <div class="grid gap-2">
                    <Label for="name">Name</Label>
                    <Input id="name" v-model="form.name" autocomplete="name" />
                    <InputError :message="form.errors.name" />
                </div>

                <div class="grid gap-2">
                    <Label for="email">Email</Label>
                    <Input id="email" v-model="form.email" type="email" autocomplete="email" />
                    <InputError :message="form.errors.email" />
                </div>

                <div class="grid gap-2">
                    <Label for="password">Password</Label>
                    <Input id="password" v-model="form.password" type="password" autocomplete="new-password" />
                    <InputError :message="form.errors.password" />
                </div>

                <div class="grid gap-2">
                    <Label for="password_confirmation">Confirm password</Label>
                    <Input id="password_confirmation" v-model="form.password_confirmation" type="password" autocomplete="new-password" />
                    <InputError :message="form.errors.password_confirmation" />
                </div>

                <Button type="submit" class="w-full" :disabled="form.processing">
                    <Spinner v-if="form.processing" />
                    Add admin
                </Button>
            </form>
        </div>
    </div>
</template>
