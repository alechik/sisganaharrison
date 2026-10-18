<?php

namespace App\Policies;

use App\Models\SubcategoriaProducto;
use App\Models\User;

class SubcategoriaProductoPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('subcategorias_productos.view');
    }

    public function view(User $user, SubcategoriaProducto $subcategoriaProducto): bool
    {
        return $user->can('subcategorias_productos.view');
    }

    public function create(User $user): bool
    {
        return $user->can('subcategorias_productos.create');
    }

    public function update(User $user, SubcategoriaProducto $subcategoriaProducto): bool
    {
        return $user->can('subcategorias_productos.update');
    }

    public function delete(User $user, SubcategoriaProducto $subcategoriaProducto): bool
    {
        return $user->can('subcategorias_productos.delete');
    }

    public function restore(User $user, SubcategoriaProducto $subcategoriaProducto): bool
    {
        return $user->can('subcategorias_productos.restore');
    }

    public function activate(User $user, SubcategoriaProducto $subcategoriaProducto): bool
    {
        return $user->can('subcategorias_productos.activate');
    }
}
