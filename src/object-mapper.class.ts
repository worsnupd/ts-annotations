import { MetadataKeys } from './constants/';
import { PathMetadata, TypeMetadata } from './metadata';

export const primitivesMap = new Map<Function, Function>();
primitivesMap.set(String, (val: any): string => `${val}`);
primitivesMap.set(Number, (val: any): number => typeof val === 'boolean' ? Number(val) : parseFloat(val));
primitivesMap.set(Boolean, (val: any): boolean => !!val);

export class ObjectMapper {

    public readValue<T>(json: string | any, typeRef: any, ...args: any[]): T {

        let instance: T = new typeRef(...args);
        const pathMapping: Map<string, PathMetadata> = typeRef.prototype.pathMapping;
        const typeMapping: Map<string, TypeMetadata> = typeRef.prototype.typeMapping;

        if (pathMapping && typeMapping) {
            pathMapping.forEach((pathMap: PathMetadata, propertyKey: string) => {

                let value = pathMap.useParentJson ? json : this.getValueFromObjectPaths(json, pathMap.paths);

                if (value !== null && value !== undefined) {
                    let propertyType: Function = typeMapping.get(propertyKey).type;

                    if (!!propertyType) {
                        const primitiveConvert = primitivesMap.get(propertyType);

                        if (primitiveConvert) {
                            value = primitiveConvert(value);
                        } else if (propertyType === Array && Reflect.hasMetadata(MetadataKeys.ARRAY_TYPE, typeRef.prototype, propertyKey)) {
                           const arrayType = Reflect.getMetadata(MetadataKeys.ARRAY_TYPE, typeRef.prototype, propertyKey);
                            value = value.map(arrayItem => {
                                if (primitivesMap.has(arrayType)) {
                                    return primitivesMap.get(arrayType)(arrayItem);
                                }
                                return this.readValue(arrayItem, arrayType);
                            });
                        } else {
                            value = this.readValue(value, propertyType);
                        }
                    }
                }

                if (value !== undefined && !(pathMap.ignoreNull && value === null)) {
                    instance[propertyKey] = value;
                }
            });
        }

        const callbacks = typeRef.prototype.deserializeCallbacks || [];

        if (callbacks.length) {
            callbacks.forEach((fn) => {
                if (typeof instance[fn] === 'function') {
                    instance[fn].call(instance, instance, json, typeRef, this);
                }
            });
        }
        return instance;
    }

    private getValueFromObjectPaths(obj: any, paths: string[]): any {
        let numPaths = paths.length;
        let index = 0;
        let value = undefined;

        while (typeof value === 'undefined' && index < numPaths) {
            value = this.getValueFromObjectPath(obj, paths[index++]);
        }

        return value;
    }

    private getValueFromObjectPath(obj: any, path: string): any {
        try {
            let objectKey;
            const objectKeyMatches = path.match(/\[([^\]]+)\]/);

            if (objectKeyMatches) {
                objectKey = objectKeyMatches[1];

                let objectKeyValue;
                objectKeyValue = this.getValueFromObjectPath(obj, objectKey);

                if (typeof objectKeyValue !== 'undefined') {
                    path = path.replace(objectKey, objectKeyValue.toString());
                }
            }

            obj = path.replace(/\[(\w+)\]/, '.$1').split('.').reduce(function (o, i) { return o[i]; }, obj);
        } catch (e) {
            obj = undefined;
        }
        return obj;
    };

}
