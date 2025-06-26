<?php

namespace App\Http\Controllers\Api;

use App\DTOs\DatabaseDTO;
use App\Http\Controllers\Controller;
use App\Models\DatabaseModel;
use App\Services\DatabaseService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class DatabaseController extends Controller
{
    protected $databaseService;

    public function __construct(DatabaseService $databaseService)
    {
        $this->databaseService = $databaseService;
    }
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tables' => 'nullable|array',
            'relationships' => 'nullable|array',
        ]);

        $dto = new DatabaseDTO(array_merge(
            $request->only(['name', 'description', 'tables', 'relationships']),
            ['user_id' => Auth::id()]
        ));

        $database = $this->databaseService->createDatabase($dto);

        return response()->json($database, 201);
    }
    public function index()
    {
        $userId = Auth::id();
        $databases = $this->databaseService->getAllForUser($userId);
        return response()->json($databases);
    }

    public function show(DatabaseModel $database)
    {
        return response()->json($database);
    }

    public function update(Request $request, DatabaseModel $database)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'tables' => 'nullable|array',
            'relationships' => 'nullable|array',
        ]);

        $dto = new DatabaseDTO(array_merge(
            $request->only(['name', 'description', 'tables', 'relationships']),
            ['user_id' => $database->user_id]
        ));

        $updatedDatabase = $this->databaseService->updateDatabase($database, $dto);

        return response()->json($updatedDatabase);
    }

    public function destroy(DatabaseModel $database)
    {
        $this->databaseService->deleteDatabase($database);
        return response()->json(null, 204);
    }

    public function saveAllChanges(Request $request, DatabaseModel $database)
    {
        $request->validate([
            'tables' => 'nullable|array',
            'relationships' => 'nullable|array',
        ]);

        $database->tables = $request->input('tables', []);
        $database->relationships = $request->input('relationships', []);
        $database->save();

        return response()->json($database);
    }

    public function exportSchema(DatabaseModel $database)
    {
        $schema = [
            'tables' => $database->tables,
            'relationships' => $database->relationships,
        ];

        return response()->json($schema);
    }

    public function importSchema(Request $request, DatabaseModel $database)
    {
        $request->validate([
            'tables' => 'required|array',
            'relationships' => 'required|array',
        ]);

        $database->tables = $request->input('tables');
        $database->relationships = $request->input('relationships');
        $database->save();

        return response()->json($database);
    }

    public function generateSQL(DatabaseModel $database)
    {
        $sql = '-- SQL schema for database: ' . $database->name . PHP_EOL;

        foreach ($database->tables ?? [] as $table) {
            $sql .= "CREATE TABLE {$table['name']} (...);\n";
        }

        return response()->json(['sql' => $sql]);
    }
}
