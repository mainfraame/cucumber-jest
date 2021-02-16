import {default as supportCodeLibraryBuilder} from '@cucumber/cucumber/lib/support_code_library_builder';
import {uuid} from '@cucumber/messages/dist/src/IdGenerator';

supportCodeLibraryBuilder.reset(process.cwd(), uuid());
