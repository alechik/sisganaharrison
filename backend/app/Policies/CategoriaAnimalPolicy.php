<?php

namespace App\Policies;

use App\Models\CategoriaAnimal;
use App\Models\User;

class CategoriaAnimalPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->can('categorias_animales.view');
    }

    public function view(User $user, CategoriaAnimal $categoriaAnimal): bool
    {
        return $user->can('categorias_animales.view');
    }

    public function create(User $user): bool
    {
        return $user->can('categorias_animales.create');
    }

    public function update(User $user, CategoriaAnimal $categoriaAnimal): bool
    {
        return $user->can('categorias_animales.update');
    }

    public function delete(User $user, CategoriaAnimal $categoriaAnimal): bool
    {
        return $user->can('categorias_animales.delete');
    }

    public function restore(User $user, CategoriaAnimal $categoriaAnimal): bool
    {
        return $user->can('categorias_animales.restore');
    }

    public function activate(User $user, CategoriaAnimal $categoriaAnimal): bool
    {
        return $user->can('categorias_animales.activate');
    }
}
