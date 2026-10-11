import { applyWorldLayout, type AgencyWorld } from './agency-layouts';

// Each live study owns its direction; a past slider choice cannot theme the agency.
const world = document.documentElement.dataset.world as AgencyWorld;
if (['cybercore', 'collage', 'swiss', 'hackerlair'].includes(world)) {
  applyWorldLayout(world);
}
