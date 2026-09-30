<?php

namespace App\Enums;

enum TicketStatus: string
{
    case Pending = 'pending';
    case Reserve = 'reserve';
    case Successful = 'successful';
    case Taken = 'taken';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pending',
            self::Reserve => 'Reserve',
            self::Successful => 'Successful',
            self::Taken => 'Taken by Admin',
            self::Cancelled => 'Cancelled',
        };
    }

    /**
     * Shape used by the frontend <select> filter and status dropdown.
     */
    public static function options(): array
    {
        return array_map(
            fn (self $case) => ['value' => $case->value, 'label' => $case->label()],
            self::cases()
        );
    }
}
