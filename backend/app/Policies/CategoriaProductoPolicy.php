<?php

namespace App\Policies;

use App\Models\CategoriaProducto;
use App\Models\User;

class CategoriaProductoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('categorias_productos.view');
    }

    public function view(User $user, CategoriaProducto $categoriaProducto): bool
    {
        return $user->can('categorias_productos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('categorias_productos.create');
    }

    public function update(User $user, CategoriaProducto $categoriaProducto): bool
    {
        return $user->can('categorias_productos.update');
    }

    public function delete(User $user, CategoriaProducto $categoriaProducto): bool
    {
        return $user->can('categorias_productos.delete');
    }

    public function restore(User $user, CategoriaProducto $categoriaProducto): bool
    {
        return $user->can('categorias_productos.restore');
    }

    public function activate(User $user, CategoriaProducto $categoriaProducto): bool
    {
        return $user->can('categorias_productos.activate');
    }
}
