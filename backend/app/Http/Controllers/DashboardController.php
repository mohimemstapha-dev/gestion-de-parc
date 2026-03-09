<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // Total Revenue (all time or current month)
        $totalRevenue = DB::table('transactions')->sum('amount');
        
        // Today's Visitors
        $todayVisitors = DB::table('transactions')
            ->whereDate('created_at', Carbon::today())
            ->sum('visitor_count');

        // Revenue Change (compared to yesterday)
        $yesterdayRevenue = DB::table('transactions')
            ->whereDate('created_at', Carbon::yesterday())
            ->sum('amount');
        
        $revenueChangePercent = $yesterdayRevenue > 0 
            ? (($totalRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100 
            : 0;

        // Last 7 Days Chart Data (DB::raw)
        $chartData = DB::table('transactions')
            ->select(
                DB::raw("DATE_FORMAT(created_at, '%a') as day"),
                DB::raw('SUM(amount) as revenue'),
                DB::raw('SUM(visitor_count) as visitors')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('day')
            ->orderBy('created_at', 'ASC')
            ->get();

        // Popular Attractions (Still static or from Attractions table if available)
        $popularGames = [
            ['name' => 'Roller Coaster', 'load' => 85, 'color' => '#3b82f6'],
            ['name' => 'Ferris Wheel', 'load' => 70, 'color' => '#14b8a6'],
            ['name' => 'Bumper Cars', 'load' => 60, 'color' => '#f97316'],
            ['name' => 'Haunted House', 'load' => 45, 'color' => '#a855f7'],
            ['name' => 'Water Slide', 'load' => 30, 'color' => '#ef4444'],
        ];

        // Recent Activity from Transactions
        $recentActivity = DB::table('transactions')
            ->orderBy('created_at', 'DESC')
            ->limit(5)
            ->get()
            ->map(function($t) {
                return [
                    'id' => $t->id,
                    'type' => ucfirst($t->type),
                    'title' => 'New ' . ucfirst($t->type),
                    'description' => $t->description ?: 'Transaction processed',
                    'time' => Carbon::parse($t->created_at)->diffForHumans(),
                    'user' => 'System'
                ];
            });

        // 3. Active Tickets: Total count from tickets table (where status is active if applicable)
        $active_tickets = DB::table('tickets')->count();

        return response()->json([
            'stats' => [
                [
                    'title' => 'Total Revenue',
                    'value' => number_format($totalRevenue, 0, '.', ','),
                    'change' => round($revenueChangePercent, 1) . '%',
                    'trend' => $revenueChangePercent >= 0 ? 'up' : 'down',
                    'currency' => 'MAD',
                    'color' => '#3b82f6',
                ],
                [
                    'title' => 'Today\'s Visitors',
                    'value' => number_format($todayVisitors),
                    'change' => '+8.2%', 
                    'trend' => 'up',
                    'color' => '#14b8a6',
                ],
                [
                    'title' => 'Active Tickets',
                    'value' => number_format($active_tickets),
                    'change' => '0%',
                    'trend' => 'up',
                    'color' => '#eab308',
                ],
                [
                    'title' => 'Avg. Wait Time',
                    'value' => '0 min',
                    'change' => '0%',
                    'trend' => 'up',
                    'color' => '#a855f7',
                ],
            ],
            'chartData' => $chartData,
            'popularGames' => $popularGames,
            'recentActivity' => $recentActivity,
        ]);
    }
}
