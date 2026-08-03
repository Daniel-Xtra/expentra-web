import { zodResolver } from '@hookform/resolvers/zod';
import { useCallback, useEffect, useRef } from 'react';
import type { FieldValues, Resolver } from 'react-hook-form';
import type { z } from 'zod';
import type { PolicyCatalogResponse } from '@/types/api';
import { createCatalogSource, type CatalogSource } from '../policy-config';

type SchemaFactory<TSchema extends z.ZodTypeAny> = (source: CatalogSource) => TSchema;

export function useCatalogFormResolver<TSchema extends z.ZodTypeAny>(
  catalog: PolicyCatalogResponse,
  createSchema: SchemaFactory<TSchema>,
): Resolver<z.infer<TSchema> & FieldValues> {
  const validationRef = useRef<{
    source: CatalogSource;
    schema: TSchema;
  } | undefined>(undefined);

  if (validationRef.current == null) {
    const source = createCatalogSource(catalog);
    validationRef.current = { source, schema: createSchema(source) };
  }

  useEffect(() => {
    validationRef.current!.source.current = catalog;
  }, [catalog]);

  return useCallback((values, context, options) => {
    const resolver = zodResolver(validationRef.current!.schema as never);
    return resolver(values, context, options as never);
  }, []) as Resolver<z.infer<TSchema> & FieldValues>;
}
