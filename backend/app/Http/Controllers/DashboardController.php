<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index()
    {
        // 1. Revenue Calculations (from attraction_billet joined with attractions)
        
        // Total Revenue (all time)
        $totalRevenue = DB::table('attraction_billet')
            ->join('attractions', 'attraction_billet.id_attraction', '=', 'attractions.id')
            ->sum('attractions.prix') ?: 0;

        // Today's Revenue
        $todayRevenue = DB::table('attraction_billet')
            ->join('attractions', 'attraction_billet.id_attraction', '=', 'attractions.id')
            ->whereDate('attraction_billet.created_at', Carbon::today())
            ->sum('attractions.prix') ?: 0;

        // Yesterday's Revenue
        $yesterdayRevenue = DB::table('attraction_billet')
            ->join('attractions', 'attraction_billet.id_attraction', '=', 'attractions.id')
            ->whereDate('attraction_billet.created_at', Carbon::yesterday())
            ->sum('attractions.prix') ?: 0;
        
        $revenueChangePercent = $yesterdayRevenue > 0 
            ? (($todayRevenue - $yesterdayRevenue) / $yesterdayRevenue) * 100 
            : ($todayRevenue > 0 ? 100 : 0);

        // 2. Today's Visitors (unique visitors from billets table)
        $todayVisitors = DB::table('billets')
            ->whereDate('created_at', Carbon::today())
            ->distinct()
            ->count('id_visiteur') ?: 0;

        $yesterdayVisitors = DB::table('billets')
            ->whereDate('created_at', Carbon::yesterday())
            ->distinct()
            ->count('id_visiteur') ?: 0;

        $visitorChangePercent = $yesterdayVisitors > 0 
            ? (($todayVisitors - $yesterdayVisitors) / $yesterdayVisitors) * 100 
            : ($todayVisitors > 0 ? 100 : 0);

        // 3. Active Tickets (Total issued billets)
        $active_tickets = DB::table('billets')->count();
        $yesterday_tickets_count = DB::table('billets')
            ->whereDate('created_at', '<=', Carbon::yesterday())
            ->count();
        
        $ticketChangePercent = $yesterday_tickets_count > 0 
            ? (($active_tickets - $yesterday_tickets_count) / $yesterday_tickets_count) * 100 
            : ($active_tickets > 0 ? 100 : 0);

        // 4. Last 7 Days Chart Data (Aggregated from attraction_billet joins)
        $last7Days = collect([]);
        for ($i = 6; $i >= 0; $i--) {
            $date = Carbon::today()->subDays($i)->toDateString();
            $last7Days->put($date, [
                'day' => Carbon::parse($date)->format('D'),
                'revenue' => 0,
                'visitors' => 0
            ]);
        }

        $chartRaw = DB::table('attraction_billet')
            ->join('attractions', 'attraction_billet.id_attraction', '=', 'attractions.id')
            ->select(
                DB::raw("DATE(attraction_billet.created_at) as date"),
                DB::raw('SUM(attractions.prix) as revenue')
            )
            ->where('attraction_billet.created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->get();

        $visitorsRaw = DB::table('billets')
            ->select(
                DB::raw("DATE(created_at) as date"),
                DB::raw('count(distinct id_visiteur) as visitors')
            )
            ->where('created_at', '>=', Carbon::now()->subDays(7))
            ->groupBy('date')
            ->get();

        foreach ($chartRaw as $item) {
            if ($last7Days->has($item->date)) {
                $dayData = $last7Days->get($item->date);
                $dayData['revenue'] = (float)$item->revenue;
                $last7Days->put($item->date, $dayData);
            }
        }

        foreach ($visitorsRaw as $item) {
            if ($last7Days->has($item->date)) {
                $dayData = $last7Days->get($item->date);
                $dayData['visitors'] = (int)$item->visitors;
                $last7Days->put($item->date, $dayData);
            }
        }

        $chartData = $last7Days->values();

        // 5. Popular Attractions (from attraction_billet counts)
        $popularGames = DB::table('attractions')
            ->leftJoin('attraction_billet', 'attractions.id', '=', 'attraction_billet.id_attraction')
            ->select('attractions.nom as name', DB::raw('count(attraction_billet.id) as visits'))
            ->groupBy('attractions.id', 'attractions.nom')
            ->orderBy('visits', 'desc')
            ->limit(5)
            ->get();

        $maxVisits = $popularGames->max('visits') ?: 1;
        $popularGamesFormatted = $popularGames->map(function($item, $index) use ($maxVisits) {
            $colors = ['blue', 'teal', 'orange', 'purple', 'red'];
            return [
                'name' => $item->name,
                'load' => round(($item->visits / $maxVisits) * 100), 
                'color' => $colors[$index % 5],
            ];
        });

        // 6. Recent Activity (from latest issued billets)
        $recentActivity = DB::table('billets')
            ->join('visiteurs', 'billets.id_visiteur', '=', 'visiteurs.id')
            ->join('tickets', 'billets.id_ticket', '=', 'tickets.id')
            ->select(
                'billets.id',
                'tickets.type as ticket_type',
                'visiteurs.nom as visitor_nom',
                'visiteurs.prenom as visitor_prenom',
                'billets.created_at'
            )
            ->orderBy('billets.created_at', 'DESC')
            ->limit(5)
            ->get()
            ->map(function($b) {
                return [
                    'id' => $b->id,
                    'type' => 'Ticket',
                    'title' => 'New Ticket Issued',
                    'description' => $b->visitor_prenom . ' ' . $b->visitor_nom . ' - ' . ucfirst($b->ticket_type) . ' Ticket',
                    'time' => Carbon::parse($b->created_at)->diffForHumans(),
                    'user' => 'System'
                ];
            });

        return response()->json([
            'stats' => [
                [
                    'title' => 'Revenue',
                    'value' => number_format($todayRevenue, 0, '.', ','), // Showing today's revenue for context
                    'change' => ($revenueChangePercent >= 0 ? '+' : '') . round($revenueChangePercent, 1) . '%',
                    'trend' => $revenueChangePercent >= 0 ? 'up' : 'down',
                    'currency' => 'MAD',
                    'color' => 'blue',
                ],
                [
                    'title' => 'Visitors Today',
                    'value' => number_format($todayVisitors),
                    'change' => ($visitorChangePercent >= 0 ? '+' : '') . round($visitorChangePercent, 1) . '%', 
                    'trend' => $visitorChangePercent >= 0 ? 'up' : 'down',
                    'color' => 'teal',
                ],
                [
                    'title' => 'Active Tickets',
                    'value' => number_format($active_tickets),
                    'change' => ($ticketChangePercent >= 0 ? '+' : '') . round($ticketChangePercent, 1) . '%',
                    'trend' => $ticketChangePercent >= 0 ? 'up' : 'down',
                    'color' => 'orange',
                ],
                [
                    'title' => 'Avg. Wait Time',
                    'value' => '0 min',
                    'change' => '0%',
                    'trend' => 'up',
                    'color' => 'purple',
                ],
            ],
            'chartData' => $chartData,
            'popularGames' => $popularGamesFormatted,
            'recentActivity' => $recentActivity,
        ]);
    }
}
